import { formatDate } from "@/lib/utils";
import { IBlog } from "@/types";
import { Link } from "react-router-dom";

interface Props {
  blog: IBlog;
  index: number;
}
const TrendingBlogPost = ({ blog, index }: Props) => {
  const {
    blogId: id,
    title,
    author: {
      personalInfo: { fullname, profileImage },
    },
    createdAt: publishedAt,
  } = blog;

  return (
    <Link to={`/blogs/${id}`} className="flex gap-5 mb-5">
      <h1 className="text-4xl sm:text-3xl font-bold text-primary/20 leading-none">
        {index + 1}
      </h1>
      <div>
        <h1 className="blog-title">{title}</h1>
        <div className="flex flex-row gap-3 items-center">
          <img
            src={profileImage}
            alt="user profile image"
            className="w-7 h-7 object-cover rounded-full border-[1px] border-border"
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
      </div>
    </Link>
  );
};

export default TrendingBlogPost;
