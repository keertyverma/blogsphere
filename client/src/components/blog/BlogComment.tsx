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
import CommentList from "./CommentList";

interface Props {
  blogId?: string; // blog _id
  authorId: string;
  totalComments?: number;
}

const BlogComment = ({ blogId, authorId, totalComments = 0 }: Props) => {
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
        <CommentForm blogId={blogId} authorId={authorId} />
        <hr className="my-2" />
        <CommentList blogId={blogId} />
      </DialogContent>
    </Dialog>
  );
};

export default BlogComment;
