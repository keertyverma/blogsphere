import { useAuthStore } from "@/store";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useLoginPrompt() {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptTitle, setLoginPromptTitle] = useState("");
  const [loginPromptMessage, setLoginPromptMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const promptMessages: Record<string, { title: string; message: string }> = {
    like: {
      title: "Log in to like this blog",
      message: "Show your appreciation by liking — just log in first.",
    },
    comment: {
      title: "Log in to comment",
      message:
        "Join the conversation and share your thoughts — log in to continue.",
    },
    reply: {
      title: "Log in to reply",
      message:
        "Want to jump into the discussion? Log in to reply to this comment.",
    },
    bookmark: {
      title: "Log in to bookmark",
      message:
        "Want to save this blog for later? Log in to keep it in your bookmarks.",
    },
    write: {
      title: "Log in to write a blog",
      message:
        "Ready to share your thoughts? Log in to start writing and publishing.",
    },
  };

  const promptLoginFor = (
    action: "like" | "comment" | "reply" | "bookmark" | "write"
  ) => {
    const { title, message } = promptMessages[action];
    setLoginPromptTitle(title);
    setLoginPromptMessage(message);
    setShowLoginPrompt(true);
  };

  const handlePromptConfirm = () => {
    setShowLoginPrompt(false);
    useAuthStore.getState().setRedirectedUrl(location.pathname);
    return navigate("/login");
  };

  const handlePromptCancel = () => {
    setShowLoginPrompt(false);
  };

  return {
    showLoginPrompt,
    loginPromptTitle,
    loginPromptMessage,
    promptLoginFor,
    handlePromptConfirm,
    handlePromptCancel,
  };
}
