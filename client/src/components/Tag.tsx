import { IoClose } from "react-icons/io5";
import { Button } from "./ui/button";
import { useEditorContext } from "@/context/editorContext";

const Tag = ({ name }: { name: string }) => {
  const {
    blog: { tags },
    blog,
    setBlog,
  } = useEditorContext();

  const handleTagDelete = () => {
    setBlog({ ...blog, tags: tags.filter((t) => t !== name) });
  };
  return (
    <div className="relative p-1 md:p-2 mt-2 mr-2 px-4 md:px-4 pr-8 md:pr-10 bg-white rounded-full inline-block hover:bg-opacity-50">
      <p className="outline-none text-[14px]">{name}</p>
      <Button
        variant="ghost"
        onClick={handleTagDelete}
        className="p-0 mt-[2px] absolute right-3 md:right-2 top-1/2 -translate-y-1/2 md:mr-1"
      >
        <IoClose />
      </Button>
    </div>
  );
};

export default Tag;
