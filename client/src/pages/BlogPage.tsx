import BlogContent from "@/components/blog/BlogContent";
import BlogInteraction from "@/components/blog/BlogInteraction";
import BlogPageSkeleton from "@/components/blog/BlogPageSkeleton";
import { useGetBlog, useUpdateReads } from "@/lib/react-query/queries";
import { formatDate, handleProfileImgErr } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

const BlogPage = () => {
  const { blogId } = useParams();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: blog, isLoading, error } = useGetBlog(blogId);
  const updateReads = useUpdateReads();

  useEffect(() => {
    // Check if read count has already been updated for this blog in the current session
    const readCountKey = `hasUpdatedReadCount_${blogId}`;
    const hasUpdatedReadCount = sessionStorage.getItem(readCountKey);
    // update read count for authenticated users
    if (isAuthenticated && blogId && !hasUpdatedReadCount) {
      updateReads.mutate(blogId);
      sessionStorage.setItem(readCountKey, "true"); // Set the flag after updating read count
    }
  }, [isAuthenticated, blogId]);

  if (!blogId) return null;

  if (isLoading) return <BlogPageSkeleton />;

  if (error) console.error(error);

  if (!blog)
    return (
      <section>
        <div className="text-lg md:text-2xl text-muted-foreground font-medium text-center py-10 flex-center flex-col md:flex-row gap-2 md:gap-1">
          <p>No blog found.</p>
        </div>
      </section>
    );

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
    createdAt: publishedAt,
    isDraft,
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
          <h1
            className="text-[32px] md:text-[42px] leading-9 md:leading-tight -tracking-wide font-bold"
            role="heading"
          >
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
              <p className="text-base text-secondary-foreground font-medium capitalize">
                {fullname}
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
          author={authorDetails}
          likes={likes}
          activity={activity}
          isDraft={isDraft}
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

export default BlogPage;
