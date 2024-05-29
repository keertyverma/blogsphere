interface Props {
  quote: string;
  caption?: string;
}

const BlockQuote = ({ quote, caption }: Props) => {
  return (
    <div className="bg-primary/20 p-3 pl-5 border-l-4 border-primary">
      <p className="!text-base lg:!text-lg !leading-6">{quote}</p>
      {caption && caption.length > 0 && (
        <p className="w-full !text-sm md:!text-base mt-2 text-primary">
          {caption}
        </p>
      )}
    </div>
  );
};

export default BlockQuote;
