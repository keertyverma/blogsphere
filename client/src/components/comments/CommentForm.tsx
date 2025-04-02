import {
  useCreateComment,
  useGetUser,
  useUpdateComment,
} from "@/lib/react-query/queries";
import {
  handleProfileImgErr,
  showErrorToast,
  showSuccessToast,
} from "@/lib/utils";
import { useAuthStore } from "@/store";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Button } from "../ui/button";

interface Props {
  blogId?: string;
  existingComment?: {
    id: string;
    content: string;
  };
  closeEditForm?: () => void; // Callback to handle successful edit
}

const CommentForm = ({ blogId, existingComment, closeEditForm }: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isTextareaDisabled, setIsTextareaDisabled] = useState(true);
  const [comment, setComment] = useState(
    existingComment ? existingComment.content : ""
  );
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authUser = useAuthStore((s) => s.user);
  const setRedirectedUrl = useAuthStore((s) => s.setRedirectedUrl);
  const navigate = useNavigate();

  const { data: user, error: getUserError } = useGetUser(authUser.username);
  const {
    mutateAsync: createComment,
    isPending: isCreatingComment,
    error: creatingCommentError,
  } = useCreateComment();

  const {
    mutateAsync: updateComment,
    isPending: isUpdatingComment,
    error: updatingCommentError,
  } = useUpdateComment();

  useEffect(() => {
    // This is done to prevent textrea from auto-focusing and opening keyboard on mobile
    // Enable the textarea after the component mounts
    setIsTextareaDisabled(false);
  }, []);

  const error = getUserError || creatingCommentError || updatingCommentError;
  if (error) console.error(error);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showErrorToast("Please log in to post a comment.");
      setRedirectedUrl(location.pathname);
      return navigate("/login");
    }

    try {
      if (existingComment) {
        // update comment
        await updateComment({ id: existingComment.id, content: comment });
        showSuccessToast("Comment updated 👍");
        if (closeEditForm) closeEditForm();
      } else {
        // create comment
        const commentData = {
          blogId: blogId as string,
          content: comment,
        };
        await createComment(commentData);
      }
      textareaRef?.current && resetTextareaSize(textareaRef.current);
      setComment("");
    } catch (error) {
      if (!useAuthStore.getState().isTokenExpired) {
        showErrorToast("An error occurred. Please try again later.");
      }
    }
  };

  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto"; // Reset height to auto
    textarea.style.height = `${textarea.scrollHeight}px`; // Set height to scroll height
  };

  const resetTextareaSize = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto"; // Reset height to auto
  };

  const handleCommentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target;
    autoResizeTextarea(input);
    setComment(input.value);
  };

  return (
    <div className="mt-4">
      {isAuthenticated && (
        <div className="flex gap-3 items-center mb-2">
          <img
            src={user?.personalInfo.profileImage}
            alt="user profile image"
            className="w-10 h-10 object-cover rounded-full border-[1px] border-border shadow-lg"
            onError={handleProfileImgErr}
          />
          <p className="font-semibold capitalize">
            {user?.personalInfo.fullname}
          </p>
        </div>
      )}

      <form className="flex flex-col gap-1" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={comment}
          placeholder="Share your thoughts..."
          className="w-full min-h-[70px] resize-none outline-none py-2 !leading-6 bg-background"
          onChange={handleCommentChange}
          disabled={isTextareaDisabled}
        />
        <div className="flex justify-end">
          {existingComment && (
            <Button
              type="reset"
              variant="secondary"
              size="sm"
              className="rounded-full text-sm capitalize mr-3"
              onClick={closeEditForm}
            >
              cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            className="rounded-full text-sm capitalize flex-center gap-1"
            disabled={!comment || isCreatingComment || isUpdatingComment}
            aria-label={existingComment ? "update comment" : "create comment"}
          >
            {existingComment ? "save" : "comment"}
            {(isCreatingComment || isUpdatingComment) && (
              <LoadingSpinner className="h-6 md:w-6 text-white" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
