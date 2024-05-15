import BlogPostCard from "@/components/home/BlogPostCard";
import AnimationWrapper from "@/components/shared/AnimationWrapper";
import InPageNavigation from "@/components/shared/InPageNavigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuthContext } from "@/context/authContext";
import { useGetLatestBlog } from "@/lib/react-query/queries";
import { Navigate } from "react-router-dom";

const Home = () => {
  const { isAuthenticated } = useAuthContext();
  const {
    data: blogs,
    isLoading: isLatestBlogLoading,
    error: latestBlogFetchError,
  } = useGetLatestBlog();

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (latestBlogFetchError) console.error(latestBlogFetchError);

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

            <h1>Trending Blogs</h1>
          </InPageNavigation>
        </div>

        {/* filters & trending blogs */}
      </section>
    </AnimationWrapper>
  );
};

export default Home;
