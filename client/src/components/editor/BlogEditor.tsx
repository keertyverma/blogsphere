import useHidePopoverItems from "@/hooks/useHidePopoverItems";
import {
  useCreateBlog,
  useGetBlog,
  useUpdateBlog,
} from "@/lib/react-query/queries";
import {
  isValidBlockContent,
  showErrorToast,
  showSuccessToast,
} from "@/lib/utils";
import { useAuthStore, useEditorStore } from "@/store";
import { ICreateDraftBlog } from "@/types";
import EditorJS, { OutputBlockData, OutputData } from "@editorjs/editorjs";
import { useMediaQuery } from "@react-hook/media-query";
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { IoMdSave } from "react-icons/io";
import { IoArrowBack, IoClose, IoImageOutline } from "react-icons/io5";
import { MdOutlinePreview } from "react-icons/md";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { editorJSTools } from "@/lib/editorjs/editorjs-tools";
import AnimationWrapper from "../shared/AnimationWrapper";
import DarkThemeToggler from "../shared/DarkThemeToggler";
import FileUploader from "../shared/FileUploader";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import IconWithLoader from "../ui/icon-with-loader";
import TextWithLoader from "../ui/text-with-loader";
import BlogEditorSkeleton from "./BlogEditorSkeleton";

const BlogEditor = () => {
  // Local States
  const [toggleFileUploader, setToggleFileUploader] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Zustand Global Store
  const {
    blog,
    blog: { title, coverImgURL },
  } = useEditorStore((s) => ({ blog: s.blog }));
  const {
    setIsPublish,
    setBlog,
    textEditor,
    setTextEditor,
    isPublishClose,
    setIsPublishClose,
    setLastSavedBlog,
  } = useEditorStore();

  // URL & Navigation
  const { blogId } = useParams();
  const [searchParams] = useSearchParams();
  const isDraft = searchParams.get("isDraft") === "true";
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:640px)");

  // API calls
  const { data, isLoading } = useGetBlog({ isDraft, blogId });
  const { mutateAsync: createDraftBlog, isPending: isSaving } = useCreateBlog();
  const { mutateAsync: updateDraftBlog, isPending: isUpdating } =
    useUpdateBlog();
  const isSavingDraft = (isSaving || isUpdating) && !isAutoSaving;

  useEffect(() => {
    setIsPublishClose(false);
  }, []);

  // Initialize text editor
  const isTextEditorReady = useRef(false);
  useEffect(() => {
    if (isTextEditorReady.current) return; // Prevent text editor re-initialization

    if (blogId) {
      // edit mode
      if (!isLoading && data) {
        const blogContent = isPublishClose ? blog.content : data.content;
        initializeEditor(blogContent);
        isTextEditorReady.current = true;
      }
    } else {
      // write mode
      const blogContent =
        isPublishClose && blog.content ? blog.content : ({} as OutputData);
      initializeEditor(blogContent);
      isTextEditorReady.current = true;
    }
  }, [blogId, data, isLoading]);

  // Handle textarea auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      if (title) {
        autoResizeTextarea(textareaRef.current);
      } else {
        textareaRef.current.style.height = "2.75rem"; // Reset to default Tailwind `h-11`
      }
    }
  }, [title]);

  useHidePopoverItems();

  const initializeEditor = (content = {} as OutputData) => {
    setTextEditor(
      new EditorJS({
        holder: "text-editor",
        data: content,
        tools: editorJSTools,
        placeholder: isMobile
          ? "Start writing... Use '+' toolbar for more options."
          : "Start writing... Use '+' toolbar for more options or type '/' for commands.",
      })
    );
  };

  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto"; // Reset height first (important for shrinking)
    textarea.style.height = `${textarea.scrollHeight}px`; // Expand to fit content
  };

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleTitleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target;
    autoResizeTextarea(input);
    setBlog({ ...blog, title: input.value });
  };

  const handlePublish = async () => {
    if (!textEditor) return;

    try {
      const blogContent = await textEditor.save();
      // Ensure the blog content contains at least one block with non-empty data, which is required for publishing the blog
      const hasValidContent = blogContent.blocks.some((block) =>
        isValidBlockContent(block)
      );

      // validate blog title and content before publishing
      if (!title.trim() || !hasValidContent) {
        const errorMsg = !title.trim()
          ? !hasValidContent
            ? "You cannot publish an empty blog. Both the title and content are required."
            : "Please add a title to publish your blog."
          : "Please add content to the blog before publishing.";

        return showErrorToast(errorMsg);
      }

      setBlog({ ...blog, content: blogContent });
      setIsPublish(true);
    } catch (error) {
      console.error("Error saving blog content:", error);
      showErrorToast("Failed to save blog content. Please try again.");
    }
  };

  const getEditorContent = async (): Promise<OutputData | null> => {
    // Retrieves the current content from the text editor.
    if (!textEditor) return null;
    try {
      const data = await textEditor.save();
      return data?.blocks.length ? data : null;
    } catch (error) {
      console.error("Error retrieving text editor content:", error);
      return null;
    }
  };

  const saveDraft = async (): Promise<string | null> => {
    try {
      // Ensure title is provided
      if (!title.trim()) {
        showErrorToast("Please add a title to save the draft.");
        return null;
      }

      // Retrieve the latest editor content and update the blog state if content exists.
      const content = await getEditorContent();
      if (content) {
        setBlog({ ...blog, content });
      }

      const draftBlog = {
        title,
        content: content ? { blocks: content?.blocks } : undefined,
        coverImgURL,
        isDraft: true,
      };

      // Create a new draft or update the existing one
      const response = blogId
        ? await updateDraftBlog({ blogId, blog: draftBlog })
        : await createDraftBlog(draftBlog as ICreateDraftBlog);
      if (!response?.blogId) return null;

      // Update `lastSavedBlog` with the current blog after successfully saving the draft
      setLastSavedBlog({ ...blog });
      return response.blogId;
    } catch (error) {
      if (useAuthStore.getState().isTokenExpired) {
        return null;
      }
      throw new Error("Failed to save draft. Please try again later.");
    }
  };

  const handleSaveDraft = async () => {
    try {
      const savedBlogId = await saveDraft();
      if (!savedBlogId) return;

      showSuccessToast("Draft saved.");
      // If the blog is newly created, navigate to the editor in `edit` mode, allowing the user to continue making modifications.
      if (!blogId) {
        isTextEditorReady.current = false; // Ensures the text editor initializes with blog data in edit mode.
        navigate(`/editor/${savedBlogId}?isDraft=true`);
      }
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "An unexpected error occurred."
      );
    }
  };

  const isMeaningfulBlock = (block: OutputBlockData): boolean => {
    if (!block || !block.type) return false;
    if (block.type === "paragraph") {
      // Remove all &nbsp; and whitespace to determine if any meaningful content exists
      const rawText = block.data?.text || "";
      const cleanedText = rawText.replace(/&nbsp;/g, "").trim();
      return cleanedText !== "";
    }

    return true; // assume other blocks are meaningful by default
  };

  const hasUnsavedChanges = (): boolean => {
    // compare current editor blog and last saved blog for any unsaved changes
    const { blog: currentBlog, lastSavedBlog } = useEditorStore.getState();

    const isTitleChanged = currentBlog.title !== lastSavedBlog.title;
    const isCoverImageChanged =
      currentBlog.coverImgURL !== lastSavedBlog.coverImgURL;
    // compare blog content
    const currentContentBlocks = currentBlog.content.blocks;
    const lastSavedContentBlocks = lastSavedBlog.content.blocks;
    let isContentChanged;
    if (blogId) {
      // Edit mode - Compare full block content including empty paragraphs
      // because even changes in spacing (empty blocks) are meaningful here
      isContentChanged =
        JSON.stringify(currentContentBlocks) !==
        JSON.stringify(lastSavedContentBlocks);
    } else {
      // Create mode — only mark as unsaved if there's meaningful (non-empty) content
      // Prevents false "unsaved changes" when the editor contains only placeholder text
      isContentChanged = currentContentBlocks.some((block) =>
        isMeaningfulBlock(block)
      );
    }

    return isTitleChanged || isCoverImageChanged || isContentChanged;
  };

  const handleDraftPreview = async () => {
    try {
      // Retrieve the latest content from the text editor and update the blog state if content exists to ensure the latest changes are considered
      const content = await getEditorContent();
      if (content) {
        setBlog({ ...blog, content });
      }

      // Prevent preview if the draft is empty in create mode (i.e., no meaningful content)
      const { blog: currentBlog } = useEditorStore.getState();
      const hasMeaningfulContent = currentBlog.content.blocks.some((block) =>
        isMeaningfulBlock(block)
      );
      if (!blogId && !hasMeaningfulContent) {
        return showErrorToast(
          "Your draft is empty. Make changes to preview it."
        );
      }

      let draftBlogId: string | undefined | null = blogId;
      if (hasUnsavedChanges()) {
        // Auto-save draft before previewing
        setIsAutoSaving(true);
        draftBlogId = await saveDraft();
        if (!draftBlogId) return; // prevent navigation if auto-save failed
      }

      // Navigate to blog preview
      navigate(`/blogs/drafts/${draftBlogId}`);
    } catch (error) {
      showErrorToast(
        error instanceof Error
          ? "Auto-save failed before previewing the draft. Please try again."
          : "An unexpected error occurred."
      );
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleExitEditor = async () => {
    // Retrieve the latest content from the text editor and update the blog state if content exists to ensure the latest changes are considered
    const content = await getEditorContent();
    if (content) {
      setBlog({ ...blog, content });
    }

    // Check if there are unsaved changes before exiting
    if (hasUnsavedChanges()) {
      setIsConfirmDialogOpen(true); // Show confirmation dialog to prevent accidental data loss.
    } else {
      navigate("/"); // navigate back to feed page
    }
  };

  // show loading skeleton while fetching blog data on edit mode
  if (blogId && isLoading) return <BlogEditorSkeleton />;

  return (
    <>
      <nav className="navbar">
        <Button
          variant="outline"
          size="sm"
          className="flex-center gap-2 opacity-80 rounded-md"
          onClick={handleExitEditor}
        >
          <IoArrowBack className="text-lg" />
          <span className="max-sm:hidden">Back to home</span>
        </Button>
        <AlertDialog
          open={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
        >
          <AlertDialogContent className="!rounded-2xl">
            <AlertDialogHeader className="text-left">
              <AlertDialogTitle className="text-base">
                ⚠️ Unsaved Changes Detected
              </AlertDialogTitle>
              <AlertDialogDescription className="flex flex-col gap-0.5">
                <span>
                  You have unsaved changes. If you exit, you might lose them.
                </span>
                <span>Do you want to exit?</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row justify-end gap-3 md:gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsConfirmDialogOpen(false);
                  navigate("/"); // navigate back to feed page
                }}
                aria-label="Exit editor without saving"
              >
                Yes
              </Button>
              <Button
                onClick={() => setIsConfirmDialogOpen(false)}
                aria-label="Stay on the editor"
              >
                No
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="flex-center gap-2 md:gap-2 ml-auto">
          <DarkThemeToggler classname="md:mr-2" />

          {/* Show these buttons only if the blog is a draft (not yet published). */}
          {(!blogId || (blogId && isDraft === true)) && (
            <>
              <Button
                variant={isMobile ? "ghost" : "outline"}
                className={
                  isMobile ? "w-10 h-10 p-0" : "rounded-full capitalize"
                }
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
              >
                {isMobile ? (
                  <IconWithLoader icon={IoMdSave} isLoading={isSavingDraft} />
                ) : (
                  <TextWithLoader text="save draft" isLoading={isSavingDraft} />
                )}
              </Button>
              <Button
                variant={isMobile ? "ghost" : "outline"}
                className={
                  isMobile
                    ? "w-10 h-10 p-0"
                    : "rounded-full capitalize text-primary hover:text-primary/90"
                }
                onClick={handleDraftPreview}
                disabled={isAutoSaving}
              >
                {isMobile ? (
                  <IconWithLoader
                    icon={MdOutlinePreview}
                    isLoading={isAutoSaving}
                    colorClass="text-primary"
                  />
                ) : (
                  <TextWithLoader text="preview" isLoading={isAutoSaving} />
                )}
              </Button>
            </>
          )}

          <Button onClick={handlePublish} className="rounded-full capitalize">
            {blogId && !isDraft ? "update" : "publish"}
          </Button>
        </div>
      </nav>

      <AnimationWrapper>
        <section className="xl:px-[1vw] mx-auto w-full max-w-[900px]">
          {/* show "Draft" badge if creating or editing a draft */}
          {(!blogId || (blogId && isDraft)) && (
            <span className="draft-badge inline-block my-1 md:my-2 ml-1">
              Draft
            </span>
          )}
          <Button
            variant="ghost"
            className="capitalize rounded-full flex-center gap-2 text-sm md:text-base text-secondary-foreground px-2"
            onClick={() => setToggleFileUploader((prev) => !prev)}
          >
            <IoImageOutline className="text-xl md:text-2xl text-secondary-foreground" />
            {coverImgURL ? "edit" : "add"} cover
          </Button>
          {toggleFileUploader && (
            <div className="border-[1px] border-border rounded-lg shadow-md w-full max-w-[725px]">
              <Button
                variant="ghost"
                onClick={() => setToggleFileUploader((prev) => !prev)}
                className="flex-center ml-auto h-7"
              >
                <IoClose className="text-base md:text-lg text-secondary-foreground" />
              </Button>
              <hr className="border-border" />
              <FileUploader
                onUpload={(url) => {
                  setToggleFileUploader(false);
                  setBlog({ ...blog, coverImgURL: url });
                }}
              />
            </div>
          )}
          {coverImgURL && (
            <div className="w-full">
              <img
                src={coverImgURL}
                alt="cover image"
                className="cover-img mt-1 md:mt-4"
              />
            </div>
          )}
          <div>
            <textarea
              ref={textareaRef}
              value={title}
              placeholder="Title ..."
              className="w-full h-11 mt-5 outline-none resize-none h1-semibold !tracking-normal bg-background overflow-hidden"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>
            <div id="text-editor"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
