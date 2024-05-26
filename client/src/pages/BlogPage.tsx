import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useGetBlog } from "@/lib/react-query/queries";
import { useParams } from "react-router-dom";

const BlogPage = () => {
  const { blogId } = useParams();

  const { data: blog, isLoading, error } = useGetBlog(blogId || "default");

  if (!blogId) return null;

  if (isLoading)
    return (
      <section>
        <LoadingSpinner className="mx-auto" />
      </section>
    );

  if (error) console.error(error);

  if (!blog)
    return (
      <section>
        <div className="text-lg md:text-2xl text-muted-foreground font-medium text-center py-10 flex-center flex-col md:flex-row gap-2 md:gap-1">
          <p>No blog found.</p>
        </div>
      </section>
    );

  const { title } = blog;
  return (
    <section>
      <h1 className="text-base md:text-3xl ">{title}</h1>
    </section>
  );
};

export default BlogPage;
