import { sanitizeContent } from "@/lib/utils";
import { MdCheckBoxOutlineBlank } from "react-icons/md";

interface Meta {
  checked?: boolean;
}

interface ListItem {
  content: string;
  meta?: Meta;
  items: ListItem[];
}

interface Props {
  style: "ordered" | "unordered" | "checklist";
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
      const safeHTML = sanitizeContent(item.content);
      const isChecked = item.meta?.checked || false;

      return (
        <li key={index} className="my-2">
          {style === "ordered" && level > 0 && (
            <span className="mr-1 md:mr-2">{`${index}.`}</span>
          )}
          {style === "checklist" && (
            <span className={"mr-1 md:mr-2"}>
              {isChecked ? (
                "✅"
              ) : (
                <MdCheckBoxOutlineBlank className="inline text-muted-foreground h-5 w-5 md:h-6 md:w-6" />
              )}
            </span>
          )}

          <span dangerouslySetInnerHTML={{ __html: safeHTML }}></span>

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

const ListTag = ({
  style,
  children,
  level,
}: {
  style: "ordered" | "unordered" | "checklist";
  children: React.ReactNode;
  level: number;
}) => {
  if (style === "ordered") {
    return (
      <ol className={`${level === 0 ? "pl-5 list-decimal" : ""}`}>
        {children}
      </ol>
    );
  } else if (style === "unordered") {
    return <ul className="pl-4 md:pl-5 list-disc">{children}</ul>;
  } else {
    return (
      <ul className={`${level > 0 ? "pl-6 md:pl-8" : ""} list-none`}>
        {children}
      </ul>
    );
  }
};

export default BlockList;
