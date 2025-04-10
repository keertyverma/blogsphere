import { sanitizeContent } from "@/lib/utils";

interface Props {
  quote: string;
  caption?: string;
}

const BlockQuote = ({ quote, caption = "" }: Props) => {
  if (!quote) return null;
  const safeQuote = sanitizeContent(quote);
  const safeCaption = sanitizeContent(caption);

  return (
    <div className="bg-primary/20 p-3 pl-5 border-l-4 border-primary rounded-md">
      <blockquote
        className="!text-base lg:!text-lg [&_*]:!text-base [&_*]:lg:!text-lg !leading-6"
        dangerouslySetInnerHTML={{ __html: `&ldquo;${safeQuote}&rdquo;` }}
      />
      {safeCaption && (
        <p
          className="w-full !text-sm md:!text-base mt-2 text-muted-foreground text-right [&_*]:!text-sm [&_*]:md:!text-base"
          dangerouslySetInnerHTML={{ __html: safeCaption }}
        ></p>
      )}
    </div>
  );
};

export default BlockQuote;
