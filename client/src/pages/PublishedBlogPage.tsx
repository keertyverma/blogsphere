import BlogContent from "@/components/blog/BlogContent";
import BlogInteraction from "@/components/blog/BlogInteraction";
import BlogPageSkeleton from "@/components/blog/BlogPageSkeleton";
import { useGetPublishedBlog, useUpdateReads } from "@/lib/react-query/queries";
import {
  formatDate,
  getLastReadTimestamp,
  getUserDisplayName,
  handleProfileImgErr,
  setLastReadTimestamp,
  showErrorToast,
} from "@/lib/utils";
import { useAuthStore } from "@/store";
import { AxiosError } from "axios";
import ms from "ms";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import NotFoundMessage from "../components/shared/NotFoundMessage";

const PublishedBlogPage = () => {
  const { blogId } = useParams();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: blog, isLoading, error } = useGetPublishedBlog(blogId);
  const updateReads = useUpdateReads();

  useEffect(() => {
    if (!blogId || !isAuthenticated) return;

    const THRESHOLD = ms("24h");
    const lastRead = getLastReadTimestamp(blogId);
    const now = Date.now();

    // If no previous read or the last read is beyond the threshold, update the read count
    if (!lastRead || now - Number(lastRead) > THRESHOLD) {
      updateReads.mutate(blogId, {
        onError: (error) => {
          console.error("Failed to update read count:", error);
        },
      });
      // Store the current timestamp in localStorage for future checks
      setLastReadTimestamp(blogId, now.toString());
    }
  }, [isAuthenticated, blogId]);

  useEffect(() => {
    if (error) {
      if (error instanceof AxiosError) {
        if (error.code === "ERR_NETWORK") {
          showErrorToast("An error occurred. Please try again later.");
        }
      } else {
        showErrorToast("An unknown error occurred.");
      }
    }
  }, [error]);

  useEffect(() => {
    if (blog) {
      const {
        title,
        authorDetails: {
          personalInfo: { fullname: authorName },
        },
      } = blog;

      // Set blog page title
      document.title = `${title} | by ${getUserDisplayName(
        authorName
      )} | BlogSphere`;
      return () => {
        document.title = "BlogSphere"; // Reset title on unmount
      };
    }
  }, [blog]);

  if (!blogId) return null;

  if (isLoading) return <BlogPageSkeleton />;

  if (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return (
        <NotFoundMessage message="This blog no longer exist or has been removed." />
      );
    }

    console.error("Error fetching blog data", {
      message: error.message,
      stack: error.stack,
      blogId: blogId,
    });
  }

  if (!blog) return null;

  const {
    _id,
    title,
    coverImgURL,
    authorDetails,
    authorDetails: {
      personalInfo: { fullname, username, profileImage },
    },
    likes,
    activity,
    content,
    publishedAt,
    isDraft,
    description,
    tags,
  } = blog;

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
        <div className="flex flex-col gap-2 mb-2">
          <h1 className="text-[1.875rem] md:text-[2.625rem] leading-snug md:leading-tight tracking-normal font-bold">
            {title}
          </h1>
          <Link
            to={`/user/${username}`}
            className="flex flex-row gap-3 items-center my-2"
          >
            <img
              src={profileImage}
              alt="user profile image"
              className="w-10 h-10 object-cover rounded-full border-[1px] border-border"
              onError={handleProfileImgErr}
            />
            <div className="flex flex-col gap-1">
              <p className="text-base text-secondary-foreground font-medium">
                {getUserDisplayName(fullname)}
              </p>
              <p className="text-sm text-muted-foreground font-normal">
                Published on {publishedAt && formatDate(publishedAt)}
              </p>
            </div>
          </Link>
        </div>
        <BlogInteraction
          id={_id}
          blogId={blogId}
          title={title}
          author={authorDetails}
          likes={likes}
          activity={activity}
          isDraft={isDraft}
          description={description}
          tags={tags}
        />

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

export default PublishedBlogPage;
