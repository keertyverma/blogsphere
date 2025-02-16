import {
  useCreateBlog,
  useGetBlog,
  useUpdateBlog,
} from "@/lib/react-query/queries";
import { isValidBlockContent } from "@/lib/utils";
import { INITIAL_BLOG, useAuthStore, useEditorStore } from "@/store";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import { useMediaQuery } from "@react-hook/media-query";
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { IoMdSave } from "react-icons/io";
import { IoClose, IoImageOutline } from "react-icons/io5";
import { MdOutlinePreview } from "react-icons/md";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { editorJSTools } from "../../lib/editorjs-tools";
import AnimationWrapper from "../shared/AnimationWrapper";
import DarkThemeToggler from "../shared/DarkThemeToggler";
import FileUploader from "../shared/FileUploader";
import Logo from "../shared/Logo";
import { Button } from "../ui/button";
import IconWithLoader from "../ui/icon-with-loader";
import TextWithLoader from "../ui/text-with-loader";

const BlogEditor = () => {
  const [toggleFileUploader, setToggleFileUploader] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const {
    blog,
    blog: { title, coverImgURL, description, tags },
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

  const { mutateAsync: createDraftBlog, isPending: isSaving } = useCreateBlog();
  const { mutateAsync: updateDraftBlog, isPending: isUpdating } =
    useUpdateBlog();
  const isSavingDraft = (isSaving || isUpdating) && !isAutoSaving;

  const { blogId } = useParams();
  const [searchParams] = useSearchParams();
  const isDraft = searchParams.get("isDraft") === "true";
  const { data, isLoading } = useGetBlog({ isDraft, blogId });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:640px)");

  const initializeEditor = (content = {} as OutputData) => {
    setTextEditor(
      new EditorJS({
        holder: "text-editor",
        data: content,
        tools: editorJSTools,
        placeholder: "Type '/' for commands.",
      })
    );
  };

  useEffect(() => {
    setIsPublishClose(false);
  }, []);

  // Initialize text editor
  const isReady = useRef(false);
  useEffect(() => {
    if (blogId) {
      // edit mode
      if (!isReady.current && !isLoading && data) {
        const blogContent = isPublishClose ? blog.content : data.content;
        initializeEditor(blogContent);
        isReady.current = true;
      }
    } else {
      // write mode
      if (!isReady.current) {
        const blogContent =
          isPublishClose && blog.content ? blog.content : ({} as OutputData);
        initializeEditor(blogContent);
        isReady.current = true;
      }
    }
  }, [blogId, data, isLoading]);

  // Handle textarea auto-resize
  useEffect(() => {
    if (title && textareaRef.current) {
      autoResizeTextarea(textareaRef.current);
    }
  }, [title]);

  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto"; // Reset height to auto
    textarea.style.height = `${textarea.scrollHeight}px`; // Set height to scroll height
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

        return toast.error(errorMsg);
      }

      setBlog({ ...blog, content: blogContent });
      setIsPublish(true);
    } catch (error) {
      console.error("Error saving blog content:", error);
      toast.error("Failed to save blog content. Please try again.");
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
        toast.error("Please add a title to save the draft.");
        return null;
      }

      // Retrieve the latest editor content and update the blog state if content exists.
      const content = await getEditorContent();
      if (content) {
        setBlog({ ...blog, content });
      }

      const draftBlog = {
        title,
        description,
        content: content ? { blocks: content?.blocks } : undefined,
        coverImgURL,
        tags: tags,
        isDraft: true,
      };

      // Create a new draft or update the existing one
      const response = blogId
        ? await updateDraftBlog({ blogId, blog: draftBlog })
        : await createDraftBlog(draftBlog);
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

      toast.success("Draft saved.");
      // If the blog is newly created, navigate to the editor in `edit` mode, allowing the user to continue making modifications.
      if (!blogId) {
        navigate(`/editor/${savedBlogId}?isDraft=true`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred."
      );
    }
  };

  const hasUnsavedChanges = (): boolean => {
    // compare current editor blog and last saved blog for any unsaved changes
    const { blog: currentBlog, lastSavedBlog } = useEditorStore.getState();
    const isTitleChanged = currentBlog.title !== lastSavedBlog.title;
    const isCoverImageChanged =
      currentBlog.coverImgURL !== lastSavedBlog.coverImgURL;
    const isContentChanged =
      JSON.stringify(currentBlog.content.blocks) !==
      JSON.stringify(lastSavedBlog.content.blocks);

    return isTitleChanged || isCoverImageChanged || isContentChanged;
  };

  const handleDraftPreview = async () => {
    try {
      // Retrieve the latest editor content and update the blog state if content exists.
      const content = await getEditorContent();
      if (content) {
        setBlog({ ...blog, content });
      }

      // Prevent preview if the draft is empty
      const { blog: currentBlog } = useEditorStore.getState();
      if (
        !blogId &&
        JSON.stringify(currentBlog) === JSON.stringify(INITIAL_BLOG)
      ) {
        return toast.error("Your draft is empty. Make changes to preview it.");
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
      toast.error(
        error instanceof Error
          ? "Auto-save failed before previewing the draft. Please try again."
          : "An unexpected error occurred."
      );
    } finally {
      if (isAutoSaving) setIsAutoSaving(false);
    }
  };

  return (
    <>
      <nav className="navbar">
        <Logo />
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
          <Button
            variant="ghost"
            className="capitalize rounded-full flex-center gap-2 text-sm md:text-base text-secondary-foreground px-2"
            onClick={() => setToggleFileUploader((prev) => !prev)}
          >
            <IoImageOutline className="text-xl md:text-2xl text-secondary-foreground" />
            {blogId ? "edit" : "add"} cover
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
              className="w-full h-11 h2-semibold mt-5 md:mt-10 outline-none resize-none leading-tight bg-background"
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
