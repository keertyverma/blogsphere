import DOMPurify from "dompurify";

interface ListItem {
  content: string;
  meta: Record<string, unknown>;
  items: ListItem[];
}

interface Props {
  style: "ordered" | "unordered";
  items: ListItem[];
}

const BlockList = ({ style, items }: Props) => {
  const renderListItems = (listItems: ListItem[]) =>
    listItems.map((item, i) => {
      // sanitize the HTML content to prevent XSS attacks.
      const safeHTML = DOMPurify.sanitize(item.content);
      return (
        <li key={i} className="my-2">
          <span
            dangerouslySetInnerHTML={{
              __html: safeHTML,
            }}
          ></span>

          {/* Recursively render nested lists if items exist */}
          {item.items.length > 0 && (
            <ListTag style={style}>{renderListItems(item.items)}</ListTag>
          )}
        </li>
      );
    });

  return <ListTag style={style}>{renderListItems(items)}</ListTag>;
};

// Helper component to dynamically choose list type
const ListTag = ({
  style,
  children,
}: {
  style: "ordered" | "unordered";
  children: React.ReactNode;
}) => {
  const className =
    style === "ordered" ? "pl-5 list-decimal" : "pl-5 list-disc";
  return style === "ordered" ? (
    <ol className={className}>{children}</ol>
  ) : (
    <ul className={className}>{children}</ul>
  );
};

export default BlockList;
