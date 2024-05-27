import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuthContext } from "@/context/authContext";
import { useGetBlog, useUpdateReads } from "@/lib/react-query/queries";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

const BlogPage = () => {
  const { blogId } = useParams();

  const { token } = useAuthContext();
  const { data: blog, isLoading, error } = useGetBlog(blogId || "default");
  const updateReads = useUpdateReads();

  useEffect(() => {
    // update read count for authenticated users
    if (token && blogId) {
      console.log("udpdating read count ....");
      updateReads.mutate({ token, blogId });
    }
  }, []);

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
