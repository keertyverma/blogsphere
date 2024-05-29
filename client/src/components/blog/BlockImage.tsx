interface Props {
  url: string;
  caption?: string;
}
const BlockImage = ({ url, caption }: Props) => {
  return (
    <div className="my-4 md:my-6">
      <img src={url} className="rounded-lg object-cover" />
      {caption && caption.length > 0 && (
        <p className="w-full !text-base text-center my-2 text-muted-foreground">
          {caption}
        </p>
      )}
    </div>
  );
};

export default BlockImage;
