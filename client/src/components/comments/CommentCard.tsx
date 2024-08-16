import { getTimeAgo, handleProfileImgErr, truncateText } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { IComment } from "@/types";
import DOMPurify from "dompurify";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import CommentInteraction from "./CommentInteraction";
import ManageComment from "./ManageComment";

interface Props {
  comment: IComment;
  classname?: string;
  onEdit: () => void;
}
const CommentCard = ({ comment, classname, onEdit }: Props) => {
  const {
    commentedBy: {
      _id: commentedByUserId,
      personalInfo: { fullname, username, profileImage },
    },
    commentedAt,
    content,
    _id,
    totalReplies,
    blogAuthor,
    isEdited,
  } = comment;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const [isExpanded, setIsExpanded] = useState(false);
  const CONTENT_CHAR_LIMIT = 200;
  const truncatedContent =
    content.length > CONTENT_CHAR_LIMIT && !isExpanded
      ? truncateText(content, CONTENT_CHAR_LIMIT - 1)
      : content;

  const toggleContentExpansion = () => {
    setIsExpanded((prev) => !prev);
  };

  const formatContent = (content: string) => {
    // sanitize the HTML content to prevent XSS attacks.
    const safeContent = DOMPurify.sanitize(content).replace(/\n/g, "<br>");
    return safeContent;
  };

  return (
    <article className={`w-full flex flex-col my-2 ${classname}`}>
      <div className="flex justify-between">
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
              <div className="flex gap-2">
                <p className="text-secondary-foreground font-semibold capitalize">
                  {fullname}
                </p>
                {commentedByUserId === blogAuthor && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full dark:bg-green-800 dark:text-green-50">
                    Author
                  </span>
                )}
              </div>

              <div className="flex gap-1 text-muted-foreground font-normal">
                <p>{commentedAt && getTimeAgo(commentedAt)}</p>
                {isEdited && <p>(Edited)</p>}
              </div>
            </div>
          </div>
        </Link>
        {isAuthenticated &&
          (user.id === commentedByUserId || user.id === blogAuthor) && (
            <ManageComment
              commentId={_id}
              commentedByUserId={commentedByUserId}
              onEdit={onEdit}
            />
          )}
      </div>
      <div className="my-2">
        <span
          className="text-base leading-6 text-accent-foreground"
          dangerouslySetInnerHTML={{ __html: formatContent(truncatedContent) }}
        ></span>
        {content.length > CONTENT_CHAR_LIMIT && (
          <Button
            variant="link"
            size="sm"
            onClick={toggleContentExpansion}
            className="p-0 ml-2 h-1"
          >
            {isExpanded ? "show less" : "...show more"}
          </Button>
        )}
      </div>

      <CommentInteraction
        key={_id}
        commentId={_id}
        totalReplies={totalReplies}
      />
    </article>
  );
};

export default CommentCard;
