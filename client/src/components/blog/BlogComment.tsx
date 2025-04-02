import { DialogDescription } from "@radix-ui/react-dialog";
import { FaRegCommentDots } from "react-icons/fa";
import CommentForm from "../comments/CommentForm";
import CommentList from "../comments/CommentList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface Props {
  blogId?: string; // blog _id
  totalComments?: number;
}

const BlogComment = ({ blogId, totalComments = 0 }: Props) => {
  return (
    <Dialog>
      <DialogTrigger className="outline-none">
        <div className="w-8 h-8 flex-center hover:bg-transparent">
          <FaRegCommentDots className="text-lg" />
        </div>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-1">
        <DialogHeader className="text-left">
          <DialogTitle className="font-semibold">
            Comments {`${totalComments > 0 ? `(${totalComments})` : ""}`}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <CommentForm blogId={blogId} />
        <hr className="my-2" />
        <CommentList blogId={blogId} />
      </DialogContent>
    </Dialog>
  );
};

export default BlogComment;
