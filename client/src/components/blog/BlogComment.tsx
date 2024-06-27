import { FaRegCommentDots } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import CommentForm from "./CommentForm";

const BlogComment = () => {
  return (
    <Dialog>
      <DialogTrigger>
        <div className="w-8 h-8 flex-center hover:bg-transparent">
          <FaRegCommentDots className="text-lg" />
        </div>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-1">
        <DialogHeader className="text-left">
          <DialogTitle className="font-semibold">Comments</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <CommentForm />
        <hr className="my-2" />
        <div>{/* TODO: show comments */}</div>
      </DialogContent>
    </Dialog>
  );
};

export default BlogComment;
