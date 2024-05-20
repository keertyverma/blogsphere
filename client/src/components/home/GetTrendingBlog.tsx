import { useGetTrendingBlog } from "@/lib/react-query/queries";
import AnimationWrapper from "../shared/AnimationWrapper";
import TrendingBlogPost from "./TrendingBlogPost";
import TrendingBlogPostSkeleton from "./TrendingBlogPostSkeleton";

const GetTrendingBlog = () => {
  const { data: trendingBlogs, isLoading, error } = useGetTrendingBlog();

  if (error) console.error(error);

  return (
    <>
      {isLoading && <TrendingBlogPostSkeleton />}
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
