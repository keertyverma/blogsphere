import {
  useCreateBlog,
  useGetBlog,
  useUpdateBlog,
} from "@/lib/react-query/queries";
import { isValidBlockContent } from "@/lib/utils";
import { useAuthStore, useEditorStore } from "@/store";
import { IBlog } from "@/types";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { IoClose, IoImageOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
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
    blog: { title, coverImgURL, description, tags, isDraft },
  } = useEditorStore((s) => ({ blog: s.blog }));
  const {
    setIsPublish,
    setBlog,
    textEditor,
    setTextEditor,
    isPublishClose,
    setIsPublishClose,
  } = useEditorStore();

  const { mutateAsync: saveBlog, isPending: isSaving } = useCreateBlog();
  const { mutateAsync: updateDraftBlog, isPending: isUpdating } =
    useUpdateBlog();
  const { blogId } = useParams();
  const { data, isLoading } = useGetBlog(blogId);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

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

  // Initialize isPublishClose once on mount
  useEffect(() => {
    setIsPublishClose(false);
  }, []);

  // set text editor content
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
    if (!title.length) {
      return toast.error("Please add a title to save the draft.");
    }

    let content;
    if (textEditor) {
      try {
        const data = await textEditor.save();
        if (data?.blocks.length) {
          content = data;
          setBlog({ ...blog, content: data });
        }
      } catch (error) {
        console.log(error);
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

    try {
      if (blogId) {
        // edit mode - save updated blog as draft
        await updateDraftBlog({
          blogId,
          blog: draftBlog,
        });
        toast.success("Blog Updated");
      } else {
        // create mode - save new blog as draft
        const blog: IBlog = await saveBlog(draftBlog);
        const blogUrl = `/blogs/drafts/${blog.blogId}`;
        toast.success("Draft saved.");
        navigate(blogUrl);
      }
    } catch (error) {
      if (!useAuthStore.getState().isTokenExpired) {
        toast.error("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <>
      <nav className="navbar">
        <Logo />
        <div className="flex gap-2 ml-auto">
          <DarkThemeToggler classname="md:mr-2" />

          {(!blogId || (blogId && isDraft === true)) && (
            <Button
              variant="outline"
              className="rounded-full capitalize"
              onClick={handleSaveDraft}
              disabled={isSaving || isUpdating}
            >
              {blogId && isDraft ? "update" : "save draft"}
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
