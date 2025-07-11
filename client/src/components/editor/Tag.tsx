import { IoClose } from "react-icons/io5";
import { Button } from "../ui/button";

interface TagProps {
  name: string;
  onDelete: (tag: string) => void;
}

const Tag = ({ name, onDelete }: TagProps) => {
  const handleTagDelete = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    onDelete(name);
  };

  return (
    <div className="relative p-1 md:p-2 mt-2 mr-2 px-4 md:px-4 pr-8 md:pr-10 bg-header rounded-full inline-block hover:bg-opacity-50 border border-border">
      <p className="outline-none text-[14px]">{name}</p>
      <Button
        variant="ghost"
        onClick={handleTagDelete}
        className="p-0 mt-[2px] absolute right-3 md:right-2 top-1/2 -translate-y-1/2 md:mr-1 h-0"
      >
        <IoClose />
      </Button>
    </div>
  );
};

export default Tag;
