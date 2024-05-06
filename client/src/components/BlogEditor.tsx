import { useState, KeyboardEvent, ChangeEvent } from "react";
import AnimationWrapper from "./AnimationWrapper";
import Logo from "./Logo";
import { Button } from "./ui/button";
import FileUploader from "./FileUploader";
import { IoImageOutline, IoClose } from "react-icons/io5";

interface Props {
  onPublish: () => void;
}

const BlogEditor = ({ onPublish }: Props) => {
  const [toggleFileUploader, setToggleFileUploader] = useState(false);
  const [coverImgURL, setCoverImgURL] = useState("");

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.code === "Enter") {
      e.preventDefault();
    }
  };

  const handleTitleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target;
    input.style.height = `${input.scrollHeight}px`;
  };

  return (
    <>
      <nav className="navbar">
        <Logo />
        <p className="max-md:hidden w-full text-black line-clamp-1 ml-10">
          New Blog
        </p>
        <div className="flex gap-2 ml-auto">
          <Button
            variant="secondary"
            className="rounded-full capitalize border-b border-border"
          >
            save draft
          </Button>
          <Button
            onClick={() => onPublish()}
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
            className="capitalize rounded-full flex-center gap-2 text-sm md:text-base text-secondary-foreground"
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
                  setCoverImgURL(url);
                }}
              />
            </div>
          )}
          {coverImgURL && (
            <img
              src={coverImgURL}
              alt="cover image"
              className="file_uploader-img"
            />
          )}
          <textarea
            placeholder="Title ..."
            className="w-full h-20 h1-semibold mt-10 outline-none resize-none leading-tight"
            onKeyDown={handleTitleKeyDown}
            onChange={handleTitleChange}
          ></textarea>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
