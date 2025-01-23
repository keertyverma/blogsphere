import { useGetLatestBlogs } from "@/lib/react-query/queries";
import { useEditorStore } from "@/store";
import { IBlog } from "@/types";
import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import AnimationWrapper from "../shared/AnimationWrapper";
import LoadingSpinner from "../ui/LoadingSpinner";
import BlogPostCard from "./BlogPostCard";
import BlogPostCardSkeleton from "./BlogPostCardSkeleton";

const GetLatestBlogs = () => {
  const selectedTag = useEditorStore((s) => s.selectedTag);
  const { data, isLoading, error, fetchNextPage, hasNextPage } =
    useGetLatestBlogs(selectedTag);

  if (isLoading) {
    return <BlogPostCardSkeleton />;
  }

  if (error) {
    console.error(error);
    return (
      <div className="text-center w-full p-3 rounded-full bg-secondary mt-10">
        <p>Error loading blogs</p>
      </div>
    );
  }
  const fetchedBlogsCount =
    data?.pages.reduce((total, page) => total + page.results.length, 0) || 0;
  if (fetchedBlogsCount === 0) {
    return (
      <div className="text-center w-full p-3 rounded-full bg-secondary mt-10">
        <p>No blogs found</p>
      </div>
    );
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
              <BlogPostCard
                content={blog}
                author={blog.authorDetails}
                showTimeAgo={true}
                showReadCount={false}
              />
            </AnimationWrapper>
          ))}
        </React.Fragment>
      ))}
    </InfiniteScroll>
  );
};

export default GetLatestBlogs;
