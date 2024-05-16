import { formatDate } from "@/lib/utils";
import { IAuthor, IBlog } from "@/types";
import { FaRegHeart } from "react-icons/fa";
import { Link } from "react-router-dom";

interface Props {
  content: IBlog;
  author: IAuthor;
}

const BlogPostCard = ({ content, author }: Props) => {
  const {
    blogId: id,
    title,
    description,
    coverImgURL,
    tags,
    createdAt: publishedAt,
    activity,
  } = content;

  const {
    personalInfo: { fullname, profileImage },
  } = author;
  return (
    <article className="w-full md:max-w-2xl lg:max-w-3xl flex flex-col gap-4 md:gap-5 pt-0 md:pt-8 lg:p-6 lg:pb-5 mb-6 max-lg:border-b border-border lg:border lg:shadow-sm lg:rounded-2xl">
      <section className="p-0">
        <div className="flex flex-row gap-3 items-center">
          <img
            src={profileImage}
            alt="user profile image"
            className="w-9 h-9 object-cover rounded-full border-[1px] border-border"
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
        <Link to={`/blogs/${id}`}>
          <div className="w-full flex flex-col md:flex-row gap-2 sm:gap-3 md:gap-6 justify-between">
            <div>
              <h1 className="blog-title">{title}</h1>
              <p className="text:sm md:text-base text-accent-foreground max-sm:hidden line-clamp-2 leading-7">
                {description}
              </p>
            </div>
            <img
              src={coverImgURL}
              alt="blog cover image"
              className="aspect-video md:h-28 object-cover rounded-md"
            />
          </div>
        </Link>
      </section>
      <section className="flex justify-between p-0 max-lg:mb-6">
        <div className="flex items-center justify-center gap-1 text-muted-foreground">
          <FaRegHeart />
          {activity && activity?.totalLikes > 0 && (
            <p className="text-sm">{activity?.totalLikes}</p>
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
    </article>
  );
};

export default BlogPostCard;
