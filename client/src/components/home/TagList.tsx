import { Button } from "../ui/button";

const TagList = () => {
  const categories = [
    "science",
    "research",
    "photography",
    "art",
    "creativity",
    "inspiration",
    "health",
  ];

  return (
    <div className="flex gap-3 flex-wrap ">
      {categories.map((category, index) => (
        <Button
          variant="secondary"
          size="sm"
          className="text-sm rounded-full capitalize px-4"
          key={index}
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default TagList;
