import { useCreateComment, useGetUser } from "@/lib/react-query/queries";
import { handleProfileImgErr } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { ChangeEvent, useRef, useState } from "react";
import { toast } from "react-toastify";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Button } from "../ui/button";

interface Props {
  blogId?: string;
  authorId: string;
}

const CommentForm = ({ blogId, authorId }: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [comment, setComment] = useState("");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authUser = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const { data: user, isLoading, error } = useGetUser(authUser.username);
  const {
    mutateAsync: createComment,
    isPending: isCreatingComment,
    error: creatingCommentError,
  } = useCreateComment();

  if (!blogId) return null;
  if (isLoading) return <LoadingSpinner />;
  if (error || creatingCommentError)
    console.error(error || creatingCommentError);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAuthenticated) {
      return toast.error("Please log in to add a comment.");
    }

    try {
      const commentData = {
        blogId,
        blogAuthor: authorId,
        content: comment,
      };

      // create comment
      await createComment({ token, comment: commentData });
      setComment("");
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    }
  };

  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto"; // Reset height to auto
    textarea.style.height = `${textarea.scrollHeight}px`; // Set height to scroll height
  };

  const handleCommentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target;
    autoResizeTextarea(input);
    setComment(e.target.value);
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
          className="w-full min-h-[70px] resize-none focus:outline-none py-2 !leading-6"
          onChange={handleCommentChange}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            className="rounded-full text-sm capitalize"
            disabled={!comment || isCreatingComment}
          >
            comment
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
