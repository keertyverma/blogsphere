import { getTimeAgo, handleProfileImgErr } from "@/lib/utils";
import { IComment } from "@/types";
import DOMPurify from "dompurify";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import ReplyForm from "./ReplyForm";

interface Props {
  comment: IComment;
}
const CommentCard = ({ comment }: Props) => {
  const [isReplying, setIsReplying] = useState(false);
  const {
    commentedBy: {
      personalInfo: { fullname, username, profileImage },
    },
    commentedAt,
    content,
  } = comment;

  const formatContent = (content: string) => {
    // sanitize the HTML content to prevent XSS attacks.
    const safeHTML = DOMPurify.sanitize(content);
    return safeHTML.replace(/\n/g, "<br>");
  };

  return (
    <article className="w-full flex flex-col border-b border-border my-2">
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

      {/* reply on comment */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground text-sm capitalize hover:bg-transparent hover:underline"
          onClick={() => {
            setIsReplying(true);
          }}
        >
          reply
        </Button>
      </div>
      {isReplying && (
        <div className="mb-2 ml-3">
          <div className="my-1.5 ml-3.5 h-6 w-px border dark:border-slate-600"></div>
          <ReplyForm
            commentId={comment._id}
            onClose={() => setIsReplying(false)}
          />
        </div>
      )}
    </article>
  );
};

export default CommentCard;
