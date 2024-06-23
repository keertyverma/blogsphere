import BlogEditor from "@/components/editor/BlogEditor";
import PublishForm from "@/components/editor/PublishForm";
import { useAuthContext } from "@/context/authContext";
import { INITIAL_BLOG } from "@/context/editorContext";
import { useGetBlog } from "@/lib/react-query/queries";
import { useEditorStore } from "@/store";
import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";

const Editor = () => {
  const { isAuthenticated } = useAuthContext();
  const isPublish = useEditorStore((s) => s.isPublish);
  const setIsPublish = useEditorStore((s) => s.setIsPublish);
  const setBlog = useEditorStore((s) => s.setBlog);

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

  useEffect(() => {
    if (isPublish) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isPublish]);

  if (!isAuthenticated) return <Navigate to="/login" />;

  return isPublish ? <PublishForm /> : <BlogEditor />;
};

export default Editor;
