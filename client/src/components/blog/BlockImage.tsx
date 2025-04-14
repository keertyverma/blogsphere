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
        withBackground
          ? "bg-input p-4 rounded-lg border border-border overflow-hidden"
          : ""
      }`}
    >
      {/* ensures caption stays centered relative to image */}
      <div className={`${stretched ? "w-full" : "inline-block"}`}>
        <img
          src={url}
          className={`rounded-lg object-cover ${
            stretched ? "w-full" : "mx-auto"
          } ${withBackground ? "max-w-[60%] mx-auto" : ""}`}
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
