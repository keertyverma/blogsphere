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
              <h1 className="text-xl font-semibold mb-2">Latest Blogs</h1>
              {blogs?.map((blog, index) => (
                <h2 key={index}>{blog.title}</h2>
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
