import { useGetComments } from "@/lib/react-query/queries";
import { IComment } from "@/types";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Button } from "../ui/button";
import CommentContainer from "./CommentContainer";

interface Props {
  blogId?: string; // blog _id
  commentId?: string;
}
const CommentList = ({ blogId, commentId }: Props) => {
  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetComments(blogId, commentId);

  if (isLoading) return <LoadingSpinner className="mt-20 mx-auto" />;
  if (error) console.error(error);

  const comments = data?.pages.flatMap((page) => page.results) || [];

  if (comments.length === 0 && !commentId) {
    return (
      <div className="text-base text-muted-foreground font-medium text-center py-10 flex-center flex-col gap-2">
        <p>No comments yet.</p>
        <p>Be the first to comment! ✨</p>
      </div>
    );
  }

  // For comments -> show most recent comments first
  // For replies  -> show replies oldest to newest to maintain conversation history
  const renderComments = commentId
    ? comments
        .slice()
        .sort(
          (a: IComment, b: IComment) =>
            new Date(a.commentedAt).getTime() -
            new Date(b.commentedAt).getTime()
        )
    : comments;

  return (
    <>
      {renderComments.map((comment: IComment, index: number) => (
        <CommentContainer
          key={index}
          index={index}
          comment={comment}
          isLast={index === renderComments.length - 1}
        />
      ))}

      {hasNextPage && (
        <div className="flex-center">
          <Button
            variant={`${commentId ? "ghost" : "secondary"}`}
            size="sm"
            className={`rounded-full bg-transparent hover:bg-secondary underline hover:no-underline`}
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage
              ? "loading..."
              : commentId
              ? "Load more replies"
              : "Load more comments"}
          </Button>
        </div>
      )}
    </>
  );
};

export default CommentList;
