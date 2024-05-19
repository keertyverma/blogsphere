import { Button } from "../ui/button";

const TagList = () => {
  const categories = [
    "All",
    "science",
    "research",
    "photography",
    "art",
    "creativity",
    "inspiration",
    "health",
    "art",
    "creativity",
    "inspiration",
    "health",
  ];

  return (
    <div className="flex max-w-[400px] md:max-w-[800px] m-0 mb-4">
      <div className="m-0 overflow-x-auto p-0 text-nowrap">
        <div className="inline-block">
          {categories.map((category, index) => (
            <Button
              variant="secondary"
              size="sm"
              className="text-xs md:text-sm rounded-3xl capitalize px-2 md:px-4 ml-1"
              key={index}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TagList;
