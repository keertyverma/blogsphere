import Logo from "./Logo";
import { Button } from "./ui/button";

interface Props {
  onPublish: () => void;
}

const BlogEditor = ({ onPublish }: Props) => {
  return (
    <nav className="navbar">
      <Logo />
      <p className="max-md:hidden w-full text-black line-clamp-1 ml-10">
        New Blog
      </p>
      <div className="flex gap-2 ml-auto">
        <Button
          variant="secondary"
          className="rounded-full capitalize border-b border-border"
        >
          save draft
        </Button>
        <Button onClick={() => onPublish()} className="rounded-full capitalize">
          publish
        </Button>
      </div>
    </nav>
  );
};

export default BlogEditor;
