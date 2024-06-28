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

interface Props {
  blogId?: string; // blog _id
  authorId: string;
  totalParentComments?: number;
}

const BlogComment = ({ blogId, authorId, totalParentComments = 0 }: Props) => {
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
            Comments {`(${totalParentComments})`}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <CommentForm blogId={blogId} authorId={authorId} />
        <hr className="my-2" />
        <div>{/* TODO: show list of comments */}</div>
      </DialogContent>
    </Dialog>
  );
};

export default BlogComment;
