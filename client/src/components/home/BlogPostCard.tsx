import { formatDate, formateNumber, handleProfileImgErr } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { IAuthor, IBlog } from "@/types";
import { FaRegHeart } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import ManageBlog from "../blog/ManageBlog";

interface Props {
  content: IBlog;
  author: IAuthor;
  showManageBlogButtons?: boolean;
  showReadCount?: boolean;
}

const BlogPostCard = ({
  content,
  author,
  showManageBlogButtons = false,
  showReadCount = false,
}: Props) => {
  const {
    blogId: id,
    title,
    description,
    coverImgURL,
    tags,
    createdAt: publishedAt,
    activity,
    isDraft,
  } = content;

  const {
    personalInfo: { fullname, username, profileImage },
  } = author;
  const user = useAuthStore((s) => s.user);

  return (
    <article className="w-full md:max-w-2xl lg:max-w-3xl flex flex-col gap-4 pt-0 md:pt-8 lg:p-6 lg:pb-5 mb-6 max-lg:border-b border-border lg:border lg:shadow-sm lg:rounded-2xl">
      <section className="p-0">
        <div className="flex justify-between">
          <Link to={`/user/${username}`}>
            <div className="flex flex-row gap-3 items-center">
              <img
                src={profileImage}
                alt="user profile image"
                className="w-9 h-9 object-cover rounded-full border-[1px] border-border"
                onError={handleProfileImgErr}
              />
              <div className="flex-col text-sm ">
                <p className="text-secondary-foreground font-semibold capitalize">
                  {fullname}
                </p>
                <p className="text-muted-foreground font-normal">
                  {publishedAt && formatDate(publishedAt)}
                </p>
              </div>
            </div>
          </Link>
          {showManageBlogButtons && user.username === username && id && (
            <div className="mb-3">
              <ManageBlog blogId={id} />
            </div>
          )}
        </div>

        <Link to={`/blogs/${id}`}>
          <div className="w-full flex flex-row gap-2 sm:gap-3 md:gap-6 justify-between">
            <div className="flex-1">
              <h1 className="blog-title">{title}</h1>
              <p className="text-sm md:text-base text-accent-foreground line-clamp-2 leading-5 md:leading-6">
                {description}
              </p>
            </div>
            {coverImgURL && (
              <div className="w-32 h-15 md:w-40 md:h-30">
                <img
                  src={coverImgURL}
                  alt="blog cover image"
                  className="aspect-video object-cover rounded-md"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </Link>
      </section>
      <section className="flex justify-between p-0 max-lg:mb-6">
        {/* Show blog stats - total likes and read count only for published blogs */}
        {!isDraft && (
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <div className="flex-center gap-1">
              <FaRegHeart />
              {activity && activity?.totalLikes > 0 && (
                <p className="text-sm">{formateNumber(activity.totalLikes)}</p>
              )}
            </div>

            {showReadCount && user.username === username && (
              <div className="flex-center gap-1">
                <IoEyeOutline className="text-lg" />
                {activity && activity?.totalReads > 0 && (
                  <p className="text-sm">
                    {formateNumber(activity.totalReads)}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {tags?.slice(0, 2).map((tag, i) => (
            <span
              key={i}
              className="text-xs lg:text-sm font-medium text-muted-foreground bg-secondary p-1 px-2 rounded-full truncate max-w-[120px] lg:max-w-[240px] capitalize"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>
    </article>
  );
};

export default BlogPostCard;
