import { sanitizeContent } from "@/lib/utils";
import { OutputBlockData } from "@editorjs/editorjs";
import BlockCode from "./BlockCode";
import BlockImage from "./BlockImage";
import BlockList from "./BlockList";
import BlockQuote from "./BlockQuote";

interface Props {
  block: OutputBlockData;
}

const BlogContent = ({ block }: Props) => {
  const { type, data } = block;

  // Decode HTML entities and sanitize EditorJS content to prevent XSS attack
  const safeHTML = sanitizeContent(data.text);

  if (type === "header") {
    const HeadingTag = `h${data.level}` as keyof JSX.IntrinsicElements;
    return (
      <HeadingTag dangerouslySetInnerHTML={{ __html: safeHTML }}></HeadingTag>
    );
  }

  if (type === "paragraph") {
    // Preserve empty lines in paragraph
    return (
      <p
        dangerouslySetInnerHTML={{
          __html: safeHTML?.trim() ? safeHTML : "&nbsp;",
        }}
      ></p>
    );
  }

  if (type === "image")
    return (
      <BlockImage
        url={data.file.url}
        caption={data.caption}
        withBackground={data.withBackground}
        stretched={data.stretched}
      />
    );

  if (type === "quote")
    return <BlockQuote quote={data.text} caption={data.caption} />;

  if (type === "list")
    return <BlockList style={data.style} items={data.items} />;

  if (type === "code")
    return <BlockCode code={data.code} language={data.language || "plain"} />;

  // Fallback for missing or incorrect data
  return <div>Invalid block data</div>;
};

export default BlogContent;
