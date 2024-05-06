import { useEditorContext } from "@/context/editorContext";
import EditorJS from "@editorjs/editorjs";
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { IoClose, IoImageOutline } from "react-icons/io5";
import { editorJSTools } from "../lib/editorjs-tools";
import AnimationWrapper from "./AnimationWrapper";
import FileUploader from "./FileUploader";
import Logo from "./Logo";
import { Button } from "./ui/button";

const BlogEditor = () => {
  const [toggleFileUploader, setToggleFileUploader] = useState(false);
  const {
    setIsPublish,
    blog,
    blog: { title, coverImg },
    setBlog,
  } = useEditorContext();

  const isReady = useRef(false);
  useEffect(() => {
    if (!isReady.current) {
      new EditorJS({
        holder: "text-editor",
        data: undefined,
        tools: editorJSTools,
        placeholder: "Type '/' for commands.",
      });
      isReady.current = true;
    }
  }, []);

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.code === "Enter") {
      e.preventDefault();
    }
  };

  const handleTitleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target;
    input.style.height = `${input.scrollHeight}px`;
    setBlog({ ...blog, title: input.value });
  };

  return (
    <>
      <nav className="navbar">
        <Logo />
        <p className="max-md:hidden w-full text-black line-clamp-1 ml-10">
          {title?.length ? title : "New Blog"}
        </p>
        <div className="flex gap-2 ml-auto">
          <Button
            variant="secondary"
            className="rounded-full capitalize border-b border-border"
          >
            save draft
          </Button>
          <Button
            onClick={() => setIsPublish(true)}
            className="rounded-full capitalize"
          >
            publish
          </Button>
        </div>
      </nav>

      <AnimationWrapper>
        <section className="mx-auto w-full max-w-[900px] p-4">
          <Button
            variant="ghost"
            className="capitalize rounded-full flex-center gap-2 text-sm md:text-base text-secondary-foreground px-0"
            onClick={() => setToggleFileUploader((prev) => !prev)}
          >
            <IoImageOutline className="text-xl md:text-2xl text-secondary-foreground" />
            add cover
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
                  setBlog({ ...blog, coverImg: url });
                }}
              />
            </div>
          )}
          {coverImg && (
            <img
              src={coverImg}
              alt="cover image"
              className="file_uploader-img mt-1 md:mt-4"
            />
          )}
          <textarea
            placeholder="Title ..."
            className="w-full h-20 h1-semibold mt-5 md:mt-10 outline-none resize-none leading-tight"
            onKeyDown={handleTitleKeyDown}
            onChange={handleTitleChange}
          ></textarea>
          <div id="text-editor"></div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
