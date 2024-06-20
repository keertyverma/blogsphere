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
    authorDetails: {
      personalInfo: { fullname, profileImage, username },
    },
    createdAt: publishedAt,
  } = blog;

  return (
    <div className={`flex mb-5 ${index === 9 ? "gap-2" : "gap-5"}`}>
      <h1 className="text-3xl sm:text-[30px] font-bold text-primary/20 leading-none">
        {index + 1}
      </h1>

      <div>
        <Link to={`/blogs/${id}`}>
          <h2 className="blog-title !mt-1 sm:!mt-0 !text-base">{title}</h2>
        </Link>

        <Link to={`/user/${username}`}>
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
        </Link>
      </div>
    </div>
  );
};

export default TrendingBlogPost;
