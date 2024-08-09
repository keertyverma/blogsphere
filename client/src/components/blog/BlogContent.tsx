import { OutputBlockData } from "@editorjs/editorjs";
import DOMPurify from "dompurify";
import BlockImage from "./BlockImage";
import BlockList from "./BlockList";
import BlockQuote from "./BlockQuote";
import BlockCode from "./BlockCode";
import { CodeBoxOutput } from "editorjs-react-renderer";

interface Props {
  block: OutputBlockData;
}

const BlogContent = ({ block }: Props) => {
  const { type, data } = block;

  // sanitize the HTML content to prevent XSS attacks.
  const safeHTML = DOMPurify.sanitize(data.text);

  if (type === "header") {
    const HeadingTag = `h${data.level}` as keyof JSX.IntrinsicElements;
    return (
      <HeadingTag dangerouslySetInnerHTML={{ __html: safeHTML }}></HeadingTag>
    );
  }

  if (type === "paragraph")
    return <p dangerouslySetInnerHTML={{ __html: safeHTML }}></p>;

  if (type === "image")
    return <BlockImage url={data.file.url} caption={data.caption} />;

  if (type === "quote")
    return <BlockQuote quote={safeHTML} caption={data.caption} />;

  if (type === "list")
    return <BlockList style={data.style} items={data.items} />;

  // if (type === "code") return <BlockCode code={data.code} />;
  if (type === "code") return CodeBoxOutput(block);

  // Fallback for missing or incorrect data
  return <div>Invalid block data</div>;
};

export default BlogContent;
