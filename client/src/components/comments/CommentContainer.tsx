import { IComment } from "@/types";
import { useState } from "react";
import AnimationWrapper from "../shared/AnimationWrapper";
import CommentCard from "./CommentCard";
import CommentForm from "./CommentForm";

interface Props {
  comment: IComment;
  index: number;
  isLast: boolean;
}

const CommentContainer = ({ comment, index, isLast }: Props) => {
  const [isEdited, setIsEdited] = useState(false);

  return (
    <div>
      {isEdited ? (
        <>
          <CommentForm
            existingComment={{ id: comment._id, content: comment.content }}
            closeEditForm={() => setIsEdited(false)}
          />
          <hr className="my-2" />
        </>
      ) : (
        <AnimationWrapper transition={{ duration: 1, delay: index * 0.1 }}>
          <CommentCard
            comment={comment}
            classname={`${!isLast ? "border-b border-border" : ""}`}
            onEdit={() => setIsEdited(true)}
          />
        </AnimationWrapper>
      )}
    </div>
  );
};

export default CommentContainer;
