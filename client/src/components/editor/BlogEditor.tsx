import {
  useCreateBlog,
  useGetBlog,
  useUpdateBlog,
} from "@/lib/react-query/queries";
import { isValidBlockContent } from "@/lib/utils";
import { INITIAL_BLOG, useAuthStore, useEditorStore } from "@/store";
import { IBlog } from "@/types";
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

const BlogEditor = () => {
  const [toggleFileUploader, setToggleFileUploader] = useState(false);
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

  const handleSaveDraft = async () => {
    // Ensure title is provided
    if (!title.length) {
      return toast.error("Please add a title to save the draft.");
    }

    // Save editor content if text editor is present
    let content;
    if (textEditor) {
      try {
        const data = await textEditor.save();
        if (data?.blocks.length) {
          content = data;
          setBlog({ ...blog, content: data });
        }
      } catch (error) {
        console.error("Error saving text editor content:", error);
      }
    }

    const draftBlog = {
      title,
      description,
      content: content ? { blocks: content?.blocks } : undefined,
      coverImgURL,
      tags: tags,
      isDraft: true,
    };

    const saveDraft = async (
      draftBlog: IBlog,
      blogId?: string
    ): Promise<IBlog> => {
      // Handle saving draft for both create and edit mode
      const response = blogId
        ? await updateDraftBlog({ blogId, blog: draftBlog }) // Edit mode - update existing draft blog
        : await createDraftBlog(draftBlog); // create mode - save new blog as draft

      if (response?.blogId) {
        // Update `lastSavedBlog` with the current blog after successful blog save
        setLastSavedBlog({ ...blog });
      } else {
        console.error("Failed to save draft, no blogId returned in response");
      }

      return response;
    };

    try {
      const savedBlog = await saveDraft(draftBlog as IBlog, blogId);
      toast.success("Draft saved.");

      // If the blog is newly created, redirect the user to the editor in edit mode to make further changes.
      if (!blogId && savedBlog?.blogId) {
        navigate(`/editor/${savedBlog.blogId}?isDraft=true`);
      }
    } catch (error) {
      if (!useAuthStore.getState().isTokenExpired) {
        toast.error("An error occurred. Please try again later.");
      }
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
    // check if the blog is empty; nothing to preview.
    if (!blogId && JSON.stringify(blog) === JSON.stringify(INITIAL_BLOG)) {
      return toast.error("Your draft is empty. Make changes to preview it.");
    }

    // update editor content before previewing
    if (textEditor) {
      try {
        const data = await textEditor.save();
        if (data?.blocks.length) {
          setBlog({ ...blog, content: data });
        }
      } catch (error) {
        console.error("Error saving editor content:", error);
      }
    }

    // check for unsaved changes before previewing
    if (hasUnsavedChanges()) {
      return toast.error(
        "You have unsaved changes. Please save your draft before previewing."
      );

      // TODO: Implement auto-save feature in the future to improve user experience
    }

    navigate(`/blogs/drafts/${blogId}`);
  };

  return (
    <>
      <nav className="navbar">
        <Logo />
        <div className="flex-center gap-2 md:gap-2 ml-auto">
          <DarkThemeToggler classname="md:mr-2" />

          {(!blogId || (blogId && isDraft === true)) && (
            <Button
              variant={isMobile ? "ghost" : "outline"}
              className={isMobile ? "w-10 h-10 p-0" : "rounded-full capitalize"}
              onClick={handleSaveDraft}
              disabled={isSaving || isUpdating}
            >
              <IoMdSave className="md:hidden text-muted-foreground text-3xl" />
              <span className="hidden md:inline">save draft</span>
            </Button>
          )}

          {(!blogId || (blogId && isDraft === true)) && (
            <Button
              variant={isMobile ? "ghost" : "outline"}
              className={
                isMobile
                  ? "w-10 h-10 p-0"
                  : "rounded-full capitalize text-primary hover:text-primary/90"
              }
              onClick={handleDraftPreview}
            >
              <MdOutlinePreview className="md:hidden text-3xl -text-[2rem] text-primary" />
              <span className="hidden md:inline">preview</span>
            </Button>
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
