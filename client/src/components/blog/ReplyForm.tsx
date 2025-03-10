import { useCreateReply, useGetUser } from "@/lib/react-query/queries";
import { handleProfileImgErr, showErrorToast } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { ChangeEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Button } from "../ui/button";

interface Props {
  commentId: string;
  onClose: () => void;
  onSubmit: () => void;
}

const ReplyForm = ({ commentId, onClose, onSubmit }: Props) => {
  const [reply, setReply] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authUser = useAuthStore((s) => s.user);
  const setRedirectedUrl = useAuthStore((s) => s.setRedirectedUrl);
  const navigate = useNavigate();

  const { data: user, isLoading, error } = useGetUser(authUser.username);
  const {
    mutateAsync: createReply,
    isPending: isCreatingReply,
    error: creatingReplyError,
  } = useCreateReply();

  if (isLoading) return <LoadingSpinner />;
  if (error || creatingReplyError) console.error(error || creatingReplyError);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showErrorToast("Please log in to add a reply.");
      setRedirectedUrl(location.pathname);
      return navigate("/login");
    }
    try {
      // create reply
      await createReply({ commentId, content: reply });
      onSubmit();
      setReply("");
      onClose();
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

  const handleReplyChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target;
    autoResizeTextarea(input);
    setReply(input.value);
  };

  return (
    <div className="">
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
          value={reply}
          placeholder="Reply to this comment..."
          className="w-full min-h-[70px] resize-none outline-none py-2 !leading-6 bg-background"
          onChange={handleReplyChange}
        />
        <div className="flex justify-end gap-2 ">
          <Button
            type="reset"
            variant="secondary"
            size="sm"
            className="rounded-full text-sm capitalize bg-transparent"
            onClick={() => {
              onClose();
            }}
          >
            cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="rounded-full text-sm capitalize"
            disabled={!reply || isCreatingReply}
          >
            reply
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReplyForm;
