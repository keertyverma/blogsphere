import { decodeAndSanitize } from "@/lib/utils";

interface Props {
  url: string;
  caption?: string;
}
const BlockImage = ({ url, caption = "" }: Props) => {
  const safeCaption = decodeAndSanitize(caption);

  return (
    <div className="my-4 md:my-6">
      <img src={url} className="rounded-lg object-cover" />
      {safeCaption && (
        <p
          className="w-full !text-base [&_*]:!text-base text-center my-2 text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: safeCaption }}
        ></p>
      )}
    </div>
  );
};

export default BlockImage;
