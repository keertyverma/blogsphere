import { useGetUserPublishedBlogs } from "@/lib/react-query/queries";
import BlogPostCard from "../home/BlogPostCard";
import BlogPostCardSkeleton from "../home/BlogPostCardSkeleton";
import AnimationWrapper from "../shared/AnimationWrapper";

interface Props {
  authorId: string;
}
const UserPublishedBlogList = ({ authorId }: Props) => {
  const { data: blogs, isLoading, error } = useGetUserPublishedBlogs(authorId);

  if (isLoading) return <BlogPostCardSkeleton />;

  if (error) console.error(error);

  if (!blogs?.length)
    return (
      <div className="text-base md:text-xl text-muted-foreground font-medium text-center py-10 flex-center flex-col md:flex-row gap-2 md:gap-1">
        <p>No blog published yet.</p>
      </div>
    );

  return blogs.map((blog, index) => (
    <AnimationWrapper
      key={index}
      transition={{ duration: 1, delay: index * 0.1 }}
    >
      <BlogPostCard content={blog} author={blog.authorDetails} />
    </AnimationWrapper>
  ));
};

export default UserPublishedBlogList;
