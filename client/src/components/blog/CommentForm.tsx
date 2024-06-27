import { useGetUser } from "@/lib/react-query/queries";
import { handleProfileImgErr } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { ChangeEvent, useRef, useState } from "react";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Button } from "../ui/button";

const CommentForm = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [comment, setComment] = useState("");
  const authUser = useAuthStore((s) => s.user);
  const { data: user, isLoading, error } = useGetUser(authUser.username);

  if (error) console.error(error);
  if (isLoading) return <LoadingSpinner />;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("comment = ", comment);

    // TODO: reset textarea input
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
            disabled={!comment}
          >
            comment
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
