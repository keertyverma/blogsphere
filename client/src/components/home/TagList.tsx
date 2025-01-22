import { useEditorStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { Button } from "../ui/button";

const TagList = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const selectedTag = useEditorStore((s) => s.selectedTag);
  const setSelectedTag = useEditorStore((s) => s.setSelectedTag);

  // TODO: Fetch popular tags from server
  const categories = [
    "all",
    "science",
    "research",
    "photography",
    "creativity",
    "art",
    "inspiration",
    "artificial intelligence",
    "react js",
    "javascript",
    "typescript",
    "next js",
  ];

  // Reset selected tag on component mount
  useEffect(() => {
    setSelectedTag("all");
  }, [setSelectedTag]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth / 2; // Adjust scroll amount if necessary
      const newScrollPosition =
        direction === "left"
          ? scrollLeft - scrollAmount
          : scrollLeft + scrollAmount;
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      });
    }
  };

  const updateArrowsVisibility = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth);
    }
  };

  useEffect(() => {
    updateArrowsVisibility();
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", updateArrowsVisibility);
      return () => {
        scrollContainer.removeEventListener("scroll", updateArrowsVisibility);
      };
    }
  }, []);

  return (
    <div className="relative w-full -max-w-[90%] md:max-w-[400px] lg:max-w-[500px] xl:max-w-[800px] p-0 md:mt-4 mb-4">
      {showLeftArrow && (
        <Button
          variant={"secondary"}
          size={"icon"}
          className="max-md:hidden absolute left-0 top-0 bottom-0 z-10 flex-center bg-background hover:bg-accent border hover:border-muted-foreground/40"
          onClick={() => handleScroll("left")}
        >
          <IoChevronBackOutline className="text-lg text-muted-foreground" />
        </Button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex gap-1 text-nowrap overflow-x-auto md:overflow-x-hidden md:overflow-y-hidden scroll-smooth"
      >
        {categories.map((category, index) => (
          <Button
            variant="secondary"
            size="sm"
            className={`h-6 md:h-8 text-xs md:text-sm rounded-[8px] capitalize px-2 md:px-3 m-1 ml-0 border border-muted-foreground/40 ${
              selectedTag === category
                ? "bg-slate-600 text-white hover:bg-slate-500"
                : " "
            }`}
            key={index}
            onClick={() => {
              if (selectedTag === category) {
                // deselect
                setSelectedTag("all");
              } else {
                setSelectedTag(category);
              }
            }}
          >
            {category}
          </Button>
        ))}
      </div>
      {showRightArrow && (
        <Button
          variant={"secondary"}
          size={"icon"}
          className="max-md:hidden absolute right-0 top-0 bottom-0 z-10 flex-center bg-background hover:bg-accent border hover:border-muted-foreground/40"
          onClick={() => handleScroll("right")}
        >
          <IoChevronForwardOutline className="text-lg text-muted-foreground" />
        </Button>
      )}
    </div>
  );
};

export default TagList;
