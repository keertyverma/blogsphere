import { useEditorContext } from "@/context/editorContext";
import AnimationWrapper from "./AnimationWrapper";
import { Button } from "./ui/button";
import { IoClose } from "react-icons/io5";

const PublishForm = () => {
  const {
    blog: { title, coverImg, description },
    setIsPublish,
  } = useEditorContext();

  return (
    <AnimationWrapper>
      <section>
        <Button
          variant="ghost"
          className="absolute right-[5vw] top-[1%] md:top-[2%] z-10"
          onClick={() => setIsPublish(false)}
        >
          <IoClose className="text-xl md:text-2xl" />
        </Button>
        {/* preview */}
        <div className="max-w-[550px] center">
          <p className="text-md md:text-lg text-muted-foreground mb-1">
            Preview
          </p>

          {coverImg && (
            <div className="w-full rounded-lg overflow-hidden bg-gray-200 mt-4">
              <img src={coverImg} className="cover-img" />
            </div>
          )}

          <h1 className="h1-medium mt-2 line-clamp-2">{title}</h1>

          <p className="text-xl line-clamp-2 leading-7 mt-4">{description}</p>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default PublishForm;
