import { useLoginPrompt } from "@/hooks/useLoginPrompt";
import { useCreateReply, useGetUser } from "@/lib/react-query/queries";
import { handleProfileImgErr, showErrorToast } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { ChangeEvent, useRef, useState } from "react";
import LoginPromptModal from "../shared/LoginPromptModal";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Button } from "../ui/button";

interface Props {
  commentId: string;
  onClose: () => void;
  onSubmit: () => void;
}

const ReplyForm = ({ commentId, onClose, onSubmit }: Props) => {
  const [reply, setReply] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authUser = useAuthStore((s) => s.user);
  const { data: user, error } = useGetUser(authUser.username);
  const {
    mutateAsync: createReply,
    isPending: isCreatingReply,
    error: creatingReplyError,
  } = useCreateReply();
  const {
    showLoginPrompt,
    loginPromptTitle,
    loginPromptMessage,
    promptLoginFor,
    handlePromptConfirm,
    handlePromptCancel,
  } = useLoginPrompt();

  if (error || creatingReplyError) console.error(error || creatingReplyError);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAuthenticated) {
      return promptLoginFor("reply");
    }
    try {
      // create reply
      await createReply({ commentId, content: reply });
      onSubmit();
      setReply("");
      setIsExpanded(false);
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
    setIsExpanded(!!input.value);
  };

  const handleCancel = () => {
    setReply("");
    setIsExpanded(false);
    onClose();
  };

  return (
    <div className="flex gap-2 items-start mt-2">
      {isAuthenticated && (
        <img
          src={user?.personalInfo.profileImage}
          alt="user profile image"
          className="w-10 h-10 object-cover rounded-full border-[1px] border-border shadow-lg"
          onError={handleProfileImgErr}
        />
      )}

      <form
        className="flex flex-col w-full rounded-2xl border border-border p-2"
        onSubmit={handleSubmit}
      >
        <textarea
          ref={textareaRef}
          value={reply}
          placeholder="Add a reply..."
          className="w-full min-h-[40px] resize-none outline-none !leading-6 bg-background"
          onChange={handleReplyChange}
        />

        {isExpanded && (
          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-full text-sm bg-transparent"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="rounded-full text-sm flex-center gap-1"
              disabled={!reply.trim() || isCreatingReply}
            >
              Reply
              {isCreatingReply && (
                <LoadingSpinner className="h-6 md:w-6 text-white" />
              )}
            </Button>
          </div>
        )}
      </form>
      <LoginPromptModal
        open={showLoginPrompt}
        title={loginPromptTitle}
        message={loginPromptMessage}
        onConfirm={handlePromptConfirm}
        onCancel={handlePromptCancel}
      />
    </div>
  );
};

export default ReplyForm;
