import { sanitizeContent } from "@/lib/utils";

interface Props {
  url: string;
  caption?: string;
  withBackground?: boolean;
  stretched?: boolean;
}

const BlockImage = ({
  url,
  caption = "",
  withBackground = false,
  stretched = false,
}: Props) => {
  const safeCaption = sanitizeContent(caption);

  return (
    <div
      className={`w-full flex justify-center my-4 md:my-6 ${
        withBackground ? "bg-muted p-4 rounded-lg" : ""
      }`}
    >
      {/* ensures caption stays centered relative to image */}
      <div className={`${stretched ? "w-full" : "inline-block"}`}>
        <img
          src={url}
          className={`rounded-lg object-cover aspect-video ${
            stretched ? "w-full" : "mx-auto"
          }`}
        />
        {safeCaption && (
          <p
            className="w-full !text-base [&_*]:!text-base text-center my-1 text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: safeCaption }}
          ></p>
        )}
      </div>
    </div>
  );
};

export default BlockImage;
