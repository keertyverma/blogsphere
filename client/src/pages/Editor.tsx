import BlogEditor from "@/components/editor/BlogEditor";
import PublishForm from "@/components/editor/PublishForm";
import { useAuthContext } from "@/context/authContext";
import { INITIAL_BLOG, useEditorContext } from "@/context/editorContext";
import { useGetBlog } from "@/lib/react-query/queries";
import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";

const Editor = () => {
  const { isAuthenticated } = useAuthContext();
  const { isPublish, setIsPublish, setBlog } = useEditorContext();

  const { blogId } = useParams();
  const { data } = useGetBlog(blogId);

  useEffect(() => {
    if (blogId && data) {
      // edit mode
      setBlog(data);
    } else {
      // create mode
      setBlog(INITIAL_BLOG);
    }

    setIsPublish(false);
  }, [blogId, data]);

  if (!isAuthenticated) return <Navigate to="/login" />;

  return isPublish ? <PublishForm /> : <BlogEditor />;
};

export default Editor;
