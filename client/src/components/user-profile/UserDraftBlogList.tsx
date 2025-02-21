import { useGetUserDraftBlogs } from "@/lib/react-query/queries";
import { formatDate } from "@/lib/utils";
import { IBlog } from "@/types";
import React from "react";
import { Link } from "react-router-dom";
import ManageBlog from "../blog/ManageBlog";
import BlogPostCardSkeleton from "../home/BlogPostCardSkeleton";
import AnimationWrapper from "../shared/AnimationWrapper";
import { Button } from "../ui/button";

interface Props {
  authorId: string;
  searchTerm?: string;
}
const UserDraftBlogList = ({ searchTerm }: Props) => {
  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetUserDraftBlogs(searchTerm);

  if (isLoading) return <BlogPostCardSkeleton />;

  if (error) console.error(error);

  const fetchedBlogsCount =
    data?.pages.reduce((total, page) => total + page.results.length, 0) || 0;
  if (fetchedBlogsCount === 0) {
    return (
      <div className="text-base md:text-xl text-muted-foreground font-medium text-center py-10 flex-center flex-col md:flex-row gap-2 md:gap-1">
        {searchTerm ? (
          <>
            <p>No draft blogs found.</p>
            <p>Try new keyword or phrase.</p>
          </>
        ) : (
          <p>No draft blogs yet.</p>
        )}
      </div>
    );
  }

  return (
    <>
      {data?.pages.map((page, pageIndex) => (
        <React.Fragment key={pageIndex}>
          {page.results.map((blog: IBlog, index: number) => {
            const { blogId, title, lastEditedAt } = blog;

            return (
              <AnimationWrapper
                key={index}
                transition={{ duration: 1, delay: index * 0.1 }}
              >
                <article className="w-full md:max-w-2xl lg:max-w-3xl flex justify-between gap-2 pt-0 lg:py-5 lg:px-6 mb-2 md:mb-6 max-lg:border-b border-border lg:border lg:shadow-sm lg:rounded-2xl">
                  <Link to={`/blogs/drafts/${blogId}`} className="w-full">
                    <h1 className="blog-title !font-medium">{title}</h1>
                    <div className="text-sm md:text-base text-muted-foreground max-lg:mb-4">
                      {lastEditedAt && (
                        <>Last updated: {formatDate(lastEditedAt)}</>
                      )}
                    </div>
                  </Link>
                  <div>
                    <ManageBlog blogId={blogId!} isDraft={true} />
                  </div>
                </article>
              </AnimationWrapper>
            );
          })}
        </React.Fragment>
      ))}

      {hasNextPage && (
        <div className="flex-center mt-4">
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

export default UserDraftBlogList;
