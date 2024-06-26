import { useGetSearchedBlogs } from "@/lib/react-query/queries";
import { IBlog } from "@/types";
import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import BlogPostCard from "../home/BlogPostCard";
import BlogPostCardSkeleton from "../home/BlogPostCardSkeleton";
import AnimationWrapper from "../shared/AnimationWrapper";
import LoadingSpinner from "../ui/LoadingSpinner";

interface Props {
  searchTerm: string;
}

const SearchedBlogList = ({ searchTerm }: Props) => {
  const { data, isLoading, error, fetchNextPage, hasNextPage } =
    useGetSearchedBlogs(searchTerm);

  if (isLoading) return <BlogPostCardSkeleton />;

  if (error) console.error(error);

  const fetchedBlogsCount =
    data?.pages.reduce((total, page) => total + page.results.length, 0) || 0;
  if (fetchedBlogsCount === 0)
    return (
      <div className="text-lg md:text-2xl text-muted-foreground font-medium text-center py-10 flex-center flex-col md:flex-row gap-2 md:gap-1">
        <p>No results found.</p>
        <p>Try new keyword or phrase.</p>
      </div>
    );

  return (
    <InfiniteScroll
      dataLength={fetchedBlogsCount}
      hasMore={!!hasNextPage}
      next={() => fetchNextPage()}
      loader={<LoadingSpinner className="m-auto" />}
    >
      {data?.pages.map((page, pageIndex) => (
        <React.Fragment key={pageIndex}>
          {page.results.map((blog: IBlog, index: number) => (
            <AnimationWrapper
              key={index}
              transition={{ duration: 1, delay: index * 0.1 }}
            >
              <BlogPostCard content={blog} author={blog.authorDetails} />
            </AnimationWrapper>
          ))}
        </React.Fragment>
      ))}
    </InfiniteScroll>
  );
};

export default SearchedBlogList;
