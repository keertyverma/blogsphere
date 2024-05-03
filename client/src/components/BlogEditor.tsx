import { useState } from "react";
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
              <FileUploader />
            </div>
          )}
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
