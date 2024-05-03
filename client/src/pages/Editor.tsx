import BlogEditor from "@/components/BlogEditor";
import PublishForm from "@/components/PublishForm";
import { useAuthContext } from "@/context/AuthProvider";
import { useState } from "react";
import { Navigate } from "react-router-dom";

const Editor = () => {
  const [isPublish, setIsPublish] = useState(false);
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) return <Navigate to="/login" />;

  return isPublish ? (
    <PublishForm />
  ) : (
    <BlogEditor onPublish={() => setIsPublish(true)} />
  );
};

export default Editor;
