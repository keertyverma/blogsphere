import BlogContent from "@/components/blog/BlogContent";
import BlogPageSkeleton from "@/components/blog/BlogPageSkeleton";
import ManageBlog from "@/components/blog/ManageBlog";
import { useGetDraftBlog } from "@/lib/react-query/queries";
import { useAuthStore } from "@/store";
import { AxiosError } from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import BlogNotFound from "./BlogNotFound";

const DraftBlogPage = () => {
  const { blogId } = useParams();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const { data: blog, isLoading, error } = useGetDraftBlog(blogId);

  if (!blogId) return null;

  if (isLoading) return <BlogPageSkeleton />;

  if (error) {
    if (error instanceof AxiosError && error.response) {
      const {
        response: { status },
      } = error;

      if (status === 403) {
        toast.error("You do not have permission to view this draft.");
        navigate("/");
      }
    }

    console.error("Error fetching draft blog data", {
      message: error.message,
      stack: error.stack,
      blogId: blogId,
    });
  }

  if (!blog) {
    return <BlogNotFound />;
  }

  const { title, coverImgURL, content, author } = blog;

  return (
    <section className="md:max-w-[680px] lg:max-w-[800px] max-sm:px-1 px-0 center">
      <div className="mx-4">
        {/* blog basic information */}
        {coverImgURL && (
          <img
            src={coverImgURL}
            alt="blog cover image"
            className="cover-img my-4"
          />
        )}
        <h1
          className="text-[32px] md:text-[42px] leading-9 md:leading-tight -tracking-wide font-bold mb-2"
          role="heading"
        >
          {title}
        </h1>

        {user.id === author && (
          <>
            <hr className="border-border my-1" />
            <div className="flex flex-row justify-end items-center">
              <ManageBlog blogId={blogId} />
            </div>
            <hr className="border-border my-1" />
          </>
        )}

        {/* blog content */}
        <div className="my-6 blog-page-content">
          {content.blocks?.map((block, i) => (
            <div key={i} className="my-3 lg:my-4">
              <BlogContent block={block} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DraftBlogPage;
