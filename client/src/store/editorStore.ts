import { IAuthor, IBlog } from "@/types";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import { mountStoreDevtool } from "simple-zustand-devtools";
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
  selectedTag: string;
  setSelectedTag: (selectedTag: string) => void;
}

// persist state in localStorage by default
export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      blog: INITIAL_BLOG,
      isPublish: false,
      textEditor: null,
      isPublishClose: false,
      selectedTag: "all",
      setBlog: (blog) => set({ blog }),
      setIsPublish: (isPublish) => set({ isPublish }),
      setTextEditor: (textEditor) => set({ textEditor }),
      setIsPublishClose: (isPublishClose) => set({ isPublishClose }),
      setSelectedTag: (selectedTag) => set({ selectedTag }),
    }),
    {
      name: "BlogsphereEditorStore",
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !["selectedTag"].includes(key)
          )
        ), // Exclude selectedTag from persistence
    }
  )
);

if (process.env.NODE_ENV === "development") {
  mountStoreDevtool("Editor Store", useEditorStore);
}
