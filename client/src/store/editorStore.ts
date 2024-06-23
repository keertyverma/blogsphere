import { IAuthor, IBlog } from "@/types";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const INITIAL_BLOG = {
  coverImgURL: "",
  title: "",
  description: "",
  authorDetails: {} as IAuthor,
  tags: [],
  content: {} as OutputData,
};

interface EditorStore {
  blog: IBlog;
  setBlog: (blog: IBlog) => void;
  isPublish: boolean;
  setIsPublish: (isPublish: boolean) => void;
  textEditor: EditorJS | null;
  setTextEditor: (textEditor: EditorJS | null) => void;
  isPublishClose: boolean;
  setIsPublishClose: (isPublishClose: boolean) => void;
}

// persist state in localStorage by default
export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      blog: INITIAL_BLOG,
      isPublish: false,
      textEditor: null,
      isPublishClose: false,
      setBlog: (blog) => set({ blog }),
      setIsPublish: (isPublish) => set({ isPublish }),
      setTextEditor: (textEditor) => set({ textEditor }),
      setIsPublishClose: (isPublishClose) => set({ isPublishClose }),
    }),
    { name: "BlogsphereEditorStore" }
  )
);
