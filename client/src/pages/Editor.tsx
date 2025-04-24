import BlogEditor from "@/components/editor/BlogEditor";
import PublishForm from "@/components/editor/PublishForm";
import { useGetBlog } from "@/lib/react-query/queries";
import { INITIAL_BLOG, useEditorStore } from "@/store";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useSearchParams } from "react-router-dom";

const Editor = () => {
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
      // Create mode: Initialize the blog with default values
      setBlog(INITIAL_BLOG);
      setLastSavedBlog(INITIAL_BLOG);
    }

    setIsPublish(false);

    return () => {
      document.title = "BlogSphere"; // Reset title on unmount
    };
  }, [blogId, data]);

  useEffect(() => {
    if (isPublish) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isPublish]);

  return (
    <>
      <Helmet>
        <title>
          {blogId && data?.title
            ? `Editing "${data.title}" | BlogSphere`
            : "Editor | BlogSphere"}
        </title>
        <meta
          name="description"
          content="Create, edit, and publish your blog posts on BlogSphere — your space to share ideas and stories."
        />
        <meta name="robots" content="noindex" />
      </Helmet>
      {isPublish ? <PublishForm /> : <BlogEditor />}
    </>
  );
};

export default Editor;
