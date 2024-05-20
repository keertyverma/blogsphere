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
    <div className="w-full max-w-[90%] md:max-w-[800px] p-0 md:mt-4 mb-4 overflow-x-auto text-nowrap">
      <div className="flex gap-1">
        {categories.map((category, index) => (
          <Button
            variant="secondary"
            size="sm"
            className="h-6 md:h-8 text-xs md:text-sm rounded-[8px] capitalize px-2 md:px-3 m-1 ml-0"
            key={index}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TagList;
