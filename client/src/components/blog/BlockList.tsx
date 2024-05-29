import DOMPurify from "dompurify";

interface Props {
  style: string;
  items: string[];
}

const BlockList = ({ style, items }: Props) => {
  const renderListItems = () => {
    return items.map((item, i) => {
      // sanitize the HTML content to prevent XSS attacks.
      const safeHTML = DOMPurify.sanitize(item);
      return (
        <li
          key={i}
          className="my-2"
          dangerouslySetInnerHTML={{ __html: safeHTML }}
        ></li>
      );
    });
  };

  if (style === "ordered")
    return <ol className="pl-5 list-decimal">{renderListItems()}</ol>;
  else return <ul className="pl-5 list-disc">{renderListItems()}</ul>;
};

export default BlockList;
