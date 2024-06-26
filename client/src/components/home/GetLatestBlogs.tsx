import { useGetLatestBlogs } from "@/lib/react-query/queries";
import { IBlog } from "@/types";
import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import AnimationWrapper from "../shared/AnimationWrapper";
import LoadingSpinner from "../ui/LoadingSpinner";
import BlogPostCard from "./BlogPostCard";
import BlogPostCardSkeleton from "./BlogPostCardSkeleton";

interface Props {
  selectedTag: string;
}

const GetLatestBlogs = ({ selectedTag }: Props) => {
  const { data, isLoading, error, fetchNextPage, hasNextPage } =
    useGetLatestBlogs(selectedTag);

  const fetchedBlogsCount =
    data?.pages.reduce((total, page) => total + page.results.length, 0) || 0;

  if (error) {
    console.error(error);
    return (
      <div className="text-center w-full p-3 rounded-full bg-muted mt-10">
        <p>Error loading blogs</p>
      </div>
    );
  }

  if (isLoading) {
    return <BlogPostCardSkeleton />;
  }

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

export default GetLatestBlogs;
