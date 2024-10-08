import DOMPurify from "dompurify";

interface Props {
  quote: string;
  caption?: string;
}

const BlockQuote = ({ quote, caption }: Props) => {
  if (!quote) return null;

  return (
    <div className="bg-primary/20 p-3 pl-5 border-l-4 border-primary rounded-md">
      <blockquote className="!text-base lg:!text-lg !leading-6">
        &ldquo;{quote}&rdquo;
      </blockquote>
      {caption && caption.length > 0 && (
        <p
          className="quote-caption w-full !text-sm md:!text-base mt-2 text-muted-foreground text-right"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(caption) }}
        ></p>
      )}
    </div>
  );
};

export default BlockQuote;
