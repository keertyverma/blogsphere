import { useGetLatestBlog } from "@/lib/react-query/queries";
import AnimationWrapper from "../shared/AnimationWrapper";
import BlogPostCard from "./BlogPostCard";
import BlogPostCardSkeleton from "./BlogPostCardSkeleton";

interface Props {
  selectedTag: string;
}

const GetLatestBlogs = ({ selectedTag }: Props) => {
  const { data: blogs, isLoading, error } = useGetLatestBlog(selectedTag);

  if (error) console.error(error);

  return (
    <>
      {isLoading && <BlogPostCardSkeleton />}
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
    </>
  );
};

export default GetLatestBlogs;
