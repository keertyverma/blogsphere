import BlogEditor from "@/components/editor/BlogEditor";
import PublishForm from "@/components/editor/PublishForm";
import { useAuthContext } from "@/context/authContext";
import { useEditorContext } from "@/context/editorContext";
import { useGetBlog } from "@/lib/react-query/queries";
import { IAuthor } from "@/types";
import { OutputData } from "@editorjs/editorjs";
import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";

const Editor = () => {
  const { isAuthenticated } = useAuthContext();
  const { isPublish, setBlog } = useEditorContext();

  const { blogId } = useParams();
  const { data } = useGetBlog(blogId);

  useEffect(() => {
    if (blogId && data) {
      setBlog(data);
    } else {
      setBlog({
        coverImgURL: "",
        title: "",
        description: "",
        authorDetails: {} as IAuthor,
        tags: [],
        content: {} as OutputData,
      });
    }
  }, [blogId, data]);

  if (!isAuthenticated) return <Navigate to="/login" />;

  return isPublish ? <PublishForm /> : <BlogEditor />;
};

export default Editor;
