import { useGetTrendingBlogs } from "@/lib/react-query/queries";
import AnimationWrapper from "../shared/AnimationWrapper";
import TrendingBlogPost from "./TrendingBlogPost";
import TrendingBlogPostSkeleton from "./TrendingBlogPostSkeleton";

const GetTrendingBlog = () => {
  const { data: trendingBlogs, isLoading, error } = useGetTrendingBlogs();

  if (isLoading) return <TrendingBlogPostSkeleton />;

  if (error) console.error(error);

  return (
    <>
      {trendingBlogs?.map((blog, index) => (
        <AnimationWrapper
          key={index}
          transition={{ duration: 1, delay: index * 0.1 }}
        >
          <TrendingBlogPost blog={blog} index={index} />
        </AnimationWrapper>
      ))}
    </>
  );
};

export default GetTrendingBlog;
