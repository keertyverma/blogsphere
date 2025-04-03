import { QUERY_KEYS } from "@/lib/react-query/queryKeys";
import { formateNumber } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FaRegCommentDots } from "react-icons/fa";
import ReplyForm from "../blog/ReplyForm";
import { Button } from "../ui/button";
import CommentList from "./CommentList";

interface Props {
  commentId: string;
  totalReplies: number;
}

const CommentInteraction = ({ commentId, totalReplies }: Props) => {
  const [replyCount, setReplyCount] = useState(totalReplies);
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Update the reply count when totalReplies props changes
    setReplyCount(totalReplies);
  }, [totalReplies]);

  const handleToggleReplies = () => {
    setShowReplies((prev) => !prev);

    // If replies are being shown, trigger a refetch of the replies
    if (!showReplies) {
      // This will ensure CommentList fetches the latest replies
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_BLOG_COMMENTS, "", commentId],
      });
    }
  };

  return (
    <div className="flex flex-col mb-2">
      <div className="flex flex-row justify-between items-center flex-nowrap gap-2 text-secondary-foreground">
        <div className="flex-center">
          {replyCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              className="text-lg p-1 pl-0 bg-transparent hover:bg-transparent"
              onClick={handleToggleReplies}
              aria-label="show reply list"
            >
              <FaRegCommentDots className="text-lg" />
            </Button>
          )}
          {showReplies ? (
            <p
              className="hover:underline text-muted-foreground text-sm"
              onClick={handleToggleReplies}
            >
              Hide replies
            </p>
          ) : (
            replyCount > 0 && (
              <p className="text-sm">
                {formateNumber(replyCount)}{" "}
                {replyCount === 1 ? "reply" : "replies"}
              </p>
            )
          )}
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="text-sm capitalize bg-transparent hover:bg-transparent hover:underline h-5"
          aria-label="reply to comment"
          onClick={() => {
            setIsReplying(true);
          }}
        >
          reply
        </Button>
      </div>

      {showReplies && (
        <div className="mb-2 ml-3 border-l-[3px] pl-2">
          <CommentList commentId={commentId} />
        </div>
      )}
      {isReplying && (
        <div className="mb-2 ml-3 border-l-[3px] pl-2">
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
