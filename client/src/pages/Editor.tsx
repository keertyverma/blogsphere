import BlogEditor from "@/components/editor/BlogEditor";
import PublishForm from "@/components/editor/PublishForm";
import { useAuthContext } from "@/context/authContext";
import { useEditorContext } from "@/context/editorContext";
import { Navigate } from "react-router-dom";

const Editor = () => {
  const { isAuthenticated } = useAuthContext();
  const { isPublish } = useEditorContext();

  if (!isAuthenticated) return <Navigate to="/login" />;

  return isPublish ? <PublishForm /> : <BlogEditor />;
};

export default Editor;
