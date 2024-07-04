import { getTimeAgo, handleProfileImgErr } from "@/lib/utils";
import { IComment } from "@/types";
import DOMPurify from "dompurify";
import { Link } from "react-router-dom";
import CommentInteraction from "./CommentInteraction";

interface Props {
  comment: IComment;
  classname?: string;
}
const CommentCard = ({ comment, classname }: Props) => {
  const {
    commentedBy: {
      personalInfo: { fullname, username, profileImage },
    },
    commentedAt,
    content,
    _id,
    totalReplies,
  } = comment;

  const formatContent = (content: string) => {
    // sanitize the HTML content to prevent XSS attacks.
    const safeHTML = DOMPurify.sanitize(content);
    return safeHTML.replace(/\n/g, "<br>");
  };

  return (
    <article className={`w-full flex flex-col my-2 ${classname}`}>
      {/* user info */}
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
              {commentedAt && getTimeAgo(commentedAt)}
            </p>
          </div>
        </div>
      </Link>
      <p
        className="my-2 text-base leading-6 text-accent-foreground"
        dangerouslySetInnerHTML={{ __html: formatContent(content) }}
      ></p>
      <CommentInteraction commentId={_id} totalReplies={totalReplies} />
    </article>
  );
};

export default CommentCard;
