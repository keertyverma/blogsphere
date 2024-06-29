import { useGetComments } from "@/lib/react-query/queries";
import { IComment } from "@/types";
import React from "react";
import AnimationWrapper from "../shared/AnimationWrapper";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Button } from "../ui/button";
import CommentCard from "./CommentCard";

interface Props {
  blogId?: string; // blog _id
}
const CommentList = ({ blogId }: Props) => {
  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetComments(blogId);

  if (isLoading) return <LoadingSpinner className="mt-20 mx-auto" />;
  if (error) console.error(error);

  const fetchedCommentsCount =
    data?.pages.reduce((total, page) => total + page.results.length, 0) || 0;
  if (fetchedCommentsCount === 0) {
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
            <AnimationWrapper
              key={index}
              transition={{ duration: 1, delay: index * 0.1 }}
            >
              <CommentCard comment={comment} />
            </AnimationWrapper>
          ))}
        </React.Fragment>
      ))}

      {hasNextPage && (
        <div className="flex-center">
          <Button
            variant="secondary"
            size="sm"
            className="capitalize rounded-full"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage ? "loading..." : "load more"}
          </Button>
        </div>
      )}
    </>
  );
};

export default CommentList;
