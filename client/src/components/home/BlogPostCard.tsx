import {
  formatDate,
  formateNumber,
  getTimeAgo,
  getUserDisplayName,
  handleProfileImgErr,
} from "@/lib/utils";
import { useAuthStore } from "@/store";
import { IAuthor, IBlog } from "@/types";
import { IoEyeOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import ManageBlog from "../blog/ManageBlog";
import LazyImageWithBlur from "../shared/LazyImageWithBlur";

interface Props {
  content: IBlog;
  author: IAuthor;
  showManageBlogButtons?: boolean;
  showReadCount?: boolean;
  showTimeAgo?: boolean;
  showLikeCount?: boolean;
}

const BlogPostCard = ({
  content,
  author,
  showManageBlogButtons = false,
  showReadCount = false,
  showTimeAgo = false,
  showLikeCount = true,
}: Props) => {
  const {
    blogId: id,
    title,
    description,
    coverImgURL,
    tags,
    publishedAt,
    activity,
  } = content;

  const {
    personalInfo: { fullname, username, profileImage },
  } = author;
  const user = useAuthStore((s) => s.user);
  const blogPageUrl = `/blogs/${id}`;

  return (
    <article className="w-full md:max-w-2xl lg:max-w-3xl flex flex-col gap-4 pt-1 lg:pt-8 lg:p-6 lg:pb-5 mb-6 max-lg:border-b border-border lg:border lg:shadow-sm lg:rounded-2xl">
      <section className="p-0">
        <div className="flex justify-between">
          <Link to={`/user/${username}`}>
            <div className="flex flex-row gap-3 items-center">
              <LazyImageWithBlur
                src={profileImage}
                alt="user profile image"
                className="w-9 h-9 object-cover rounded-full border-[1px] border-border"
                onError={handleProfileImgErr}
              />
              <div className="flex-col text-sm ">
                <p className="text-secondary-foreground font-semibold">
                  {getUserDisplayName(fullname)}
                </p>
                <p className="text-muted-foreground font-normal">
                  {publishedAt && showTimeAgo
                    ? getTimeAgo(publishedAt)
                    : formatDate(publishedAt)}
                </p>
              </div>
            </div>
          </Link>
          {showManageBlogButtons && user.username === username && id && (
            <div className="mb-3">
              <ManageBlog blogId={id} isDraft={false} />
            </div>
          )}
        </div>

        <Link to={blogPageUrl}>
          <div className="w-full flex flex-row gap-2 sm:gap-3 md:gap-6 justify-between">
            <div className="flex-1">
              <h1 className="blog-title">{title}</h1>
              <p className="text-sm md:text-base text-muted-foreground line-clamp-2 leading-5 md:leading-6">
                {description}
              </p>
            </div>
            {coverImgURL && (
              <div className="w-32 h-15 md:w-40 md:h-30">
                <LazyImageWithBlur
                  src={coverImgURL}
                  alt="blog cover image"
                  className="aspect-video object-cover rounded-md"
                />
              </div>
            )}
          </div>
        </Link>
      </section>
      <Link to={blogPageUrl}>
        <section className="flex justify-between p-0 max-lg:mb-6">
          {/* Show blog stats - total likes and read count only for published blogs */}
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            {showLikeCount && activity && activity.totalLikes > 0 && (
              <div className="flex-center gap-1 text-sm">
                <p>{formateNumber(activity.totalLikes)}</p>
                <span>{activity.totalLikes === 1 ? "like" : "likes"}</span>
              </div>
            )}
            {showReadCount && activity && activity.totalReads > 0 && (
              <div className="flex-center gap-1">
                <IoEyeOutline className="text-base" />
                <p className="text-sm">{formateNumber(activity.totalReads)}</p>
              </div>
            )}
          </div>

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
      </Link>
    </article>
  );
};

export default BlogPostCard;
