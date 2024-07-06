import { formateNumber } from "@/lib/utils";
import { useState } from "react";
import { FaRegCommentDots } from "react-icons/fa";
import { Button } from "../ui/button";
import CommentList from "./CommentList";
import ReplyForm from "../blog/ReplyForm";

interface Props {
  commentId: string;
  totalReplies: number;
}

const CommentInteraction = ({ commentId, totalReplies }: Props) => {
  const [replyCount, setReplyCount] = useState(totalReplies);
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className="flex flex-col mb-2">
      <div className="flex flex-row justify-between items-center flex-nowrap gap-2 text-muted-foreground hover:text-slate-600">
        <div className="flex-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            className="text-lg p-1 pl-0 bg-transparent hover:bg-transparent text-inherit"
            onClick={() => {
              setShowReplies((prev) => !prev);
            }}
            aria-label="add reply"
            disabled={!replyCount}
          >
            <FaRegCommentDots className="text-lg" />
          </Button>
          {showReplies ? (
            <p
              className="hover:underline text-muted-foreground text-sm"
              onClick={() => {
                setShowReplies((prev) => !prev);
              }}
            >
              Hide replies
            </p>
          ) : (
            replyCount > 0 && (
              <p className="text-sm">{formateNumber(replyCount)}</p>
            )
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground text-sm capitalize hover:bg-transparent hover:underline h-5"
          onClick={() => {
            setIsReplying(true);
          }}
        >
          reply
        </Button>
      </div>

      {showReplies && (
        <div className="mb-2 ml-3">
          <div className="my-1.5 ml-3.5 h-6 w-px border dark:border-slate-600"></div>
          <CommentList commentId={commentId} />
        </div>
      )}
      {isReplying && (
        <div className="mb-2 ml-3">
          <div className="my-1.5 ml-3.5 h-6 w-px border dark:border-slate-600"></div>
          <ReplyForm
            commentId={commentId}
            onClose={() => setIsReplying(false)}
            onSubmit={() => {
              setReplyCount((prev) => prev + 1);
              setShowReplies(true);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CommentInteraction;
