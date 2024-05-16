import BlogPostCard from "@/components/home/BlogPostCard";
import TrendingBlogPost from "@/components/home/TrendingBlogPost";
import AnimationWrapper from "@/components/shared/AnimationWrapper";
import InPageNavigation from "@/components/shared/InPageNavigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/authContext";
import {
  useGetLatestBlog,
  useGetTrendingBlog,
} from "@/lib/react-query/queries";
import { IoTrendingUpSharp } from "react-icons/io5";
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
  const categories = [
    "science",
    "research",
    "photography",
    "art",
    "creativity",
    "inspiration",
    "health",
  ];

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (latestBlogFetchError) console.error(latestBlogFetchError);
  if (trendingBlogFetchError) console.error(trendingBlogFetchError);

  return (
    <main>
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

              {/* Trending blogs on mobile screen*/}
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

          <aside className="min-w-[40%] lg:min-w-[400px] max-w-min max-md:hidden border-l border-border pl-8 pt-3">
            <div className="flex flex-col gap-14 mb-8">
              {/* filters */}
              <div>
                <h1 className="font-semibold text-xl mb-5">
                  Recommended Topics
                </h1>
                <div className="flex gap-3 flex-wrap">
                  {categories.map((category, index) => (
                    <Button
                      variant="secondary"
                      className="rounded-full capitalize px-4"
                      key={index}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* trending blogs on larger screen*/}
              <div className="border p-3 rounded-2xl">
                <h1 className="font-semibold text-xl mb-4 flex gap-2">
                  Trending
                  <IoTrendingUpSharp className="text-muted-foreground" />
                </h1>
                {isTrendingBlogLoading && <LoadingSpinner />}
                {trendingBlogs?.map((blog, index) => (
                  <AnimationWrapper
                    key={index}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  >
                    <TrendingBlogPost blog={blog} index={index} />
                  </AnimationWrapper>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </AnimationWrapper>
    </main>
  );
};

export default Home;
