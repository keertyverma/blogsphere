import BlogContent from "@/components/blog/BlogContent";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/authContext";
import { useGetBlog, useUpdateReads } from "@/lib/react-query/queries";
import { formatDate } from "@/lib/utils";
import { useEffect } from "react";
import { FaRegHeart } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";

const BlogPage = () => {
  const { blogId } = useParams();

  const { user, token } = useAuthContext();
  const { data: blog, isLoading, error } = useGetBlog(blogId);
  const updateReads = useUpdateReads();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if read count has already been updated for this blog in the current session
    const readCountKey = `hasUpdatedReadCount_${blogId}`;
    const hasUpdatedReadCount = sessionStorage.getItem(readCountKey);
    // update read count for authenticated users
    if (token && blogId && !hasUpdatedReadCount) {
      updateReads.mutate({ token, blogId });
      sessionStorage.setItem(readCountKey, "true"); // Set the flag after updating read count
    }
  }, [token, blogId]);

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

  const {
    title,
    coverImgURL,
    authorDetails: {
      personalInfo: { fullname, username, profileImage },
    },
    content,
    createdAt: publishedAt,
    activity,
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
        <hr className="border-border" />
        {user.username === username && (
          <div className="my-2 flex flex-row justify-between items-center">
            <div className="flex-center gap-1 text-muted-foreground">
              <FaRegHeart className="text-lg" />
              {activity && activity?.totalLikes > 0 && (
                <p className="text-sm">{activity?.totalLikes}</p>
              )}
            </div>
            <Button
              className="rounded-full"
              onClick={() => navigate(`/editor/${blogId}`)}
            >
              Edit
            </Button>
          </div>
        )}
        <hr className="border-border" />

        {/* blog content */}
        <div className="my-6 blog-page-content">
          {content.blocks?.map((block, i) => (
            <div key={i} className="my-3 lg:my-6">
              <BlogContent block={block} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogPage;
