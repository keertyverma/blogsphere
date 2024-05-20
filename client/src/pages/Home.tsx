import BlogPostCard from "@/components/home/BlogPostCard";
import BlogPostCardSkeleton from "@/components/home/BlogPostCardSkeleton";
import TagList from "@/components/home/TagList";
import TrendingBlogPost from "@/components/home/TrendingBlogPost";
import TrendingBlogPostSkeleton from "@/components/home/TrendingBlogPostSkeleton";
import AnimationWrapper from "@/components/shared/AnimationWrapper";
import InPageNavigation from "@/components/shared/InPageNavigation";
import { useAuthContext } from "@/context/authContext";
import {
  useGetLatestBlog,
  useGetTrendingBlog,
} from "@/lib/react-query/queries";
import { useState } from "react";
import { IoTrendingUpSharp } from "react-icons/io5";
import { Navigate } from "react-router-dom";

const Home = () => {
  const { isAuthenticated } = useAuthContext();
  const [selectedTag, setSelectedTag] = useState("all");

  const {
    data: blogs,
    isLoading: isLatestBlogLoading,
    error: latestBlogFetchError,
  } = useGetLatestBlog(selectedTag);

  const {
    data: trendingBlogs,
    isLoading: isTrendingBlogLoading,
    error: trendingBlogFetchError,
  } = useGetTrendingBlog();

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (latestBlogFetchError) console.error(latestBlogFetchError);
  if (trendingBlogFetchError) console.error(trendingBlogFetchError);

  return (
    <AnimationWrapper>
      <section className="h-cover md:flex md:justify-center gap-10 py-16 ">
        <div className="max-md:hidden">
          {/* Filter */}
          <TagList
            selectedTag={selectedTag}
            onSelect={(tag: string) => setSelectedTag(tag)}
          />

          {/* blogs */}
          {isLatestBlogLoading && <BlogPostCardSkeleton />}
          {blogs?.length ? (
            blogs.map((blog, index) => (
              <AnimationWrapper
                key={index}
                transition={{ duration: 1, delay: index * 0.1 }}
              >
                <BlogPostCard content={blog} author={blog.author} />
              </AnimationWrapper>
            ))
          ) : (
            <div className="text-center w-full p-3 rounded-full bg-muted mt-10">
              <p>No blogs available</p>
            </div>
          )}
        </div>

        {/* In page navigation on mobile screens */}
        <div className="md:hidden">
          <InPageNavigation
            routes={["home", "trending"]}
            defaultHidden={["trending"]}
          >
            <>
              <TagList
                selectedTag={selectedTag}
                onSelect={(tag: string) => setSelectedTag(tag)}
              />

              {/* latest blogs */}
              {isLatestBlogLoading && <BlogPostCardSkeleton />}
              {blogs?.length ? (
                blogs.map((blog, index) => (
                  <AnimationWrapper
                    key={index}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  >
                    <BlogPostCard content={blog} author={blog.author} />
                  </AnimationWrapper>
                ))
              ) : (
                <div className="text-center w-full p-2 rounded-full bg-muted mt-10">
                  <p className="text-sm md:text-base">No blogs available</p>
                </div>
              )}
            </>

            {/* Trending blogs on mobile screen*/}
            <>
              {isTrendingBlogLoading && <TrendingBlogPostSkeleton />}
              {trendingBlogs?.map((blog, index) => (
                <AnimationWrapper
                  key={index}
                  transition={{ duration: 1, delay: index * 0.1 }}
                >
                  <TrendingBlogPost blog={blog} index={index} />
                </AnimationWrapper>
              ))}
            </>
          </InPageNavigation>
        </div>

        <aside className="min-w-[40%] lg:min-w-[400px] max-w-min max-md:hidden border-l border-border pl-8 pt-3 mt-4">
          {/* trending blogs on larger screen*/}
          <div>
            <h1 className="font-semibold text-xl mb-4 flex gap-2">
              Trending
              <IoTrendingUpSharp className="text-muted-foreground" />
            </h1>
            {isTrendingBlogLoading && <TrendingBlogPostSkeleton />}
            {trendingBlogs?.map((blog, index) => (
              <AnimationWrapper
                key={index}
                transition={{ duration: 1, delay: index * 0.1 }}
              >
                <TrendingBlogPost blog={blog} index={index} />
              </AnimationWrapper>
            ))}
          </div>
        </aside>
      </section>
    </AnimationWrapper>
  );
};

export default Home;
