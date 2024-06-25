import { useGetLatestBlogs } from "@/lib/react-query/queries";
import AnimationWrapper from "../shared/AnimationWrapper";
import BlogPostCard from "./BlogPostCard";
import BlogPostCardSkeleton from "./BlogPostCardSkeleton";

interface Props {
  selectedTag: string;
}

const GetLatestBlogs = ({ selectedTag }: Props) => {
  const { data: blogs, isLoading, error } = useGetLatestBlogs(selectedTag);

  if (isLoading) return <BlogPostCardSkeleton />;

  if (error) console.error(error);

  if (!blogs?.length)
    return (
      <div className="text-center w-full p-3 rounded-full bg-muted mt-10">
        <p>No blogs available</p>
      </div>
    );

  return (
    <>
      {blogs.map((blog, index) => (
        <AnimationWrapper
          key={index}
          transition={{ duration: 1, delay: index * 0.1 }}
        >
          <BlogPostCard content={blog} author={blog.authorDetails} />
        </AnimationWrapper>
      ))}
    </>
  );
};

export default GetLatestBlogs;
