import BlogEditor from "@/components/editor/BlogEditor";
import PublishForm from "@/components/editor/PublishForm";
import { useGetBlog } from "@/lib/react-query/queries";
import { INITIAL_BLOG, useAuthStore, useEditorStore } from "@/store";
import { useEffect } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";

const Editor = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isPublish = useEditorStore((s) => s.isPublish);
  const setIsPublish = useEditorStore((s) => s.setIsPublish);
  const setBlog = useEditorStore((s) => s.setBlog);
  const setLastSavedBlog = useEditorStore((s) => s.setLastSavedBlog);

  const { blogId } = useParams();
  const [searchParams] = useSearchParams();
  const { data } = useGetBlog({
    isDraft: searchParams.get("isDraft") === "true",
    blogId,
  });

  useEffect(() => {
    if (blogId && data) {
      // Edit mode: Load existing blog data for editing
      setBlog(data);
      setLastSavedBlog(data);
    } else {
      // Create mode: Initialize the blog with default values (no data yet)
      setBlog(INITIAL_BLOG);
      setLastSavedBlog(INITIAL_BLOG);
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
