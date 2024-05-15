import BlogPostCard from "@/components/home/BlogPostCard";
import TrendingBlogPost from "@/components/home/TrendingBlogPost";
import AnimationWrapper from "@/components/shared/AnimationWrapper";
import InPageNavigation from "@/components/shared/InPageNavigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuthContext } from "@/context/authContext";
import {
  useGetLatestBlog,
  useGetTrendingBlog,
} from "@/lib/react-query/queries";
import { Navigate } from "react-router-dom";

const Home = () => {
  const { isAuthenticated } = useAuthContext();
  const {
    data: blogs,
    isLoading: isLatestBlogLoading,
    error: latestBlogFetchError,
  } = useGetLatestBlog();
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
      <section className="h-cover flex justify-center gap-10">
        {/* blogs */}
        <div className="w-full">
          <InPageNavigation
            routes={["home", "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            {/* latest blogs */}
            <>
              {isLatestBlogLoading && <LoadingSpinner />}
              {blogs?.map((blog, index) => (
                <AnimationWrapper
                  key={index}
                  transition={{ duration: 1, delay: index * 0.1 }}
                >
                  <BlogPostCard content={blog} author={blog.author} />
                </AnimationWrapper>
              ))}
            </>

            {/* Trending blogs */}
            <>
              {isTrendingBlogLoading && <LoadingSpinner />}
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

        {/* filters & trending blogs */}
      </section>
    </AnimationWrapper>
  );
};

export default Home;
