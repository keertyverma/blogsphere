import he from "he";

interface ListItem {
  content: string;
  items: ListItem[];
}

interface Props {
  style: "ordered" | "unordered";
  items: ListItem[];
}

const BlockList = ({ style, items }: Props) => {
  const renderListItems = (
    listItems: ListItem[],
    parentIndex = "",
    level = 0
  ) =>
    listItems.map((item, i) => {
      // Compute hierarchical index for ordered lists
      const index = parentIndex ? `${parentIndex}.${i + 1}` : `${i + 1}`;
      const decodedContent = he.decode(item.content);

      return (
        <li key={index} className="my-2">
          {style === "ordered" && <span className="mr-2">{index}.</span>}
          {decodedContent}

          {/* Recursively render nested lists if items exist */}
          {item.items.length > 0 && (
            <ListTag style={style} level={level + 1}>
              {renderListItems(item.items, index, level + 1)}
            </ListTag>
          )}
        </li>
      );
    });

  return (
    <ListTag style={style} level={0}>
      {renderListItems(items)}
    </ListTag>
  );
};

// Helper component to dynamically choose list type
const ListTag = ({
  style,
  children,
  level,
}: {
  style: "ordered" | "unordered";
  children: React.ReactNode;
  level: number;
}) => {
  return style === "ordered" ? (
    <ol className={`${level > 0 ? "pl-5" : ""}`}>{children}</ol>
  ) : (
    <ul className="pl-5 list-disc">{children}</ul>
  );
};

export default BlockList;
