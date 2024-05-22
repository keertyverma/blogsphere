import { IBlog } from "@/types";
import BlogPostCard from "../home/BlogPostCard";
import BlogPostCardSkeleton from "../home/BlogPostCardSkeleton";
import AnimationWrapper from "../shared/AnimationWrapper";

const GetSearchedBlog = () => {
  // TODO: fetch search results
  const blogs: IBlog[] = [];
  const isLoading = false;

  if (isLoading) return <BlogPostCardSkeleton />;

  if (!blogs.length)
    return (
      <div className="text-lg md:text-2xl text-muted-foreground font-medium text-center py-10 flex-center flex-col md:flex-row gap-2 md:gap-1">
        <p>No results found.</p>
        <p>Try new keyword or phrase.</p>
      </div>
    );

  return blogs.map((blog, index) => (
    <AnimationWrapper
      key={index}
      transition={{ duration: 1, delay: index * 0.1 }}
    >
      <BlogPostCard content={blog} author={blog.author} />
    </AnimationWrapper>
  ));
};

export default GetSearchedBlog;
