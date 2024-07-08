import { useGetComments } from "@/lib/react-query/queries";
import { IComment } from "@/types";
import React from "react";
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

  const fetchedCommentsCount =
    data?.pages.reduce((total, page) => total + page.results.length, 0) || 0;
  if (fetchedCommentsCount === 0 && !commentId) {
    return (
      <div className="text-base text-muted-foreground font-medium text-center py-10 flex-center flex-col gap-2">
        <p>No comments yet.</p>
        <p>Be the first to comment! ✨</p>
      </div>
    );
  }

  return (
    <>
      {data?.pages.map((page, pageIndex) => (
        <React.Fragment key={pageIndex}>
          {page.results.map((comment: IComment, index: number) => (
            <CommentContainer
              key={index}
              comment={comment}
              index={index}
              isLast={index === page.results.length - 1}
            />
          ))}
        </React.Fragment>
      ))}

      {hasNextPage && (
        <div className="flex-center">
          <Button
            variant={`${commentId ? "ghost" : "secondary"}`}
            size="sm"
            className={`rounded-full ${
              commentId &&
              "bg-transparent underline text-muted-foreground hover:bg-transparent"
            }`}
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage
              ? "loading..."
              : commentId
              ? "Load more replies"
              : "Load more"}
          </Button>
        </div>
      )}
    </>
  );
};

export default CommentList;
