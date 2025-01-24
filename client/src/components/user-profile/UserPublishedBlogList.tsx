import { useGetUserPublishedBlogs } from "@/lib/react-query/queries";
import { IBlog } from "@/types";
import React from "react";
import BlogPostCard from "../home/BlogPostCard";
import BlogPostCardSkeleton from "../home/BlogPostCardSkeleton";
import AnimationWrapper from "../shared/AnimationWrapper";
import { Button } from "../ui/button";

interface Props {
  authorId: string;
  searchTerm?: string;
}
const UserPublishedBlogList = ({ authorId, searchTerm }: Props) => {
  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetUserPublishedBlogs(authorId, searchTerm);

  if (isLoading) return <BlogPostCardSkeleton />;

  if (error) console.error(error);

  const fetchedBlogsCount =
    data?.pages.reduce((total, page) => total + page.results.length, 0) || 0;
  if (fetchedBlogsCount === 0) {
    return (
      <div className="text-base md:text-xl text-muted-foreground font-medium text-center py-10 flex-center flex-col md:flex-row gap-2 md:gap-1">
        {searchTerm ? (
          <>
            <p>No published blogs found.</p>
            <p>Try new keyword or phrase.</p>
          </>
        ) : (
          <p>No blogs published yet.</p>
        )}
      </div>
    );
  }

  return (
    <>
      {data?.pages.map((page, pageIndex) => (
        <React.Fragment key={pageIndex}>
          {page.results.map((blog: IBlog, index: number) => (
            <AnimationWrapper
              key={index}
              transition={{ duration: 1, delay: index * 0.1 }}
            >
              <BlogPostCard
                content={blog}
                author={blog.authorDetails}
                showManageBlogButtons={true}
                showReadCount={true}
              />
            </AnimationWrapper>
          ))}
        </React.Fragment>
      ))}

      {hasNextPage && (
        <div className="flex-center">
          <Button
            variant="secondary"
            size="sm"
            className="capitalize"
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

export default UserPublishedBlogList;
