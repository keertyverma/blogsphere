import BlogContent from "@/components/blog/BlogContent";
import BlogPageSkeleton from "@/components/blog/BlogPageSkeleton";
import ManageBlog from "@/components/blog/ManageBlog";
import { useGetDraftBlog } from "@/lib/react-query/queries";
import { showErrorToast } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import NotFoundMessage from "../components/shared/NotFoundMessage";

const DraftBlogPage = () => {
  const { blogId } = useParams();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const { data: blog, isLoading, error } = useGetDraftBlog(blogId);

  useEffect(() => {
    if (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 403) {
          showErrorToast("You do not have permission to view this draft.");
          // Redirect to the home page and prevent going back to the denied draft page.
          // This replaces the current entry in the history stack, so the user cannot navigate back to it.
          navigate("/", { replace: true });
        } else if (error.code === "ERR_NETWORK") {
          showErrorToast("An error occurred. Please try again later.");
        }
      } else {
        showErrorToast("An unknown error occurred.");
      }
    }
  }, [error, navigate]);

  if (!blogId) return null;

  if (isLoading) return <BlogPageSkeleton />;

  if (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return (
        <NotFoundMessage message="This blog no longer exist or has been removed." />
      );
    }

    console.error("Error fetching draft blog data", {
      message: error.message,
      stack: error.stack,
      blogId: blogId,
    });
  }

  if (!blog) return null;

  const { title, coverImgURL, content, author } = blog;

  return (
    <>
      <Helmet>
        <title>{title} | BlogSphere</title>
        <meta
          name="description"
          content="Preview and manage your draft blog on BlogSphere."
        />
        <meta name="robots" content="noindex" />
      </Helmet>
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
              <div className="flex flex-row justify-between items-center">
                <span className="draft-badge">Draft</span>
                <ManageBlog blogId={blogId} isDraft={true} />
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
    </>
  );
};

export default DraftBlogPage;
