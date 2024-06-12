import { IAuthor, IBlog } from "@/types";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import { ReactNode, createContext, useContext, useState } from "react";

export const INITIAL_BLOG = {
  coverImgURL: "",
  title: "",
  description: "",
  authorDetails: {} as IAuthor,
  tags: [],
  content: {} as OutputData,
};

type EditorContextType = {
  blog: IBlog;
  setBlog: React.Dispatch<React.SetStateAction<IBlog>>;
  isPublish: boolean;
  setIsPublish: React.Dispatch<React.SetStateAction<boolean>>;
  textEditor: EditorJS | null;
  setTextEditor: React.Dispatch<React.SetStateAction<EditorJS | null>>;
  isPublishClose: boolean;
  setIsPublishClose: React.Dispatch<React.SetStateAction<boolean>>;
};

const editorContext = createContext<EditorContextType>({} as EditorContextType);

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [blog, setBlog] = useState<IBlog>(INITIAL_BLOG);
  const [isPublish, setIsPublish] = useState<boolean>(false);
  const [textEditor, setTextEditor] = useState<EditorJS | null>(null);
  const [isPublishClose, setIsPublishClose] = useState<boolean>(false);

  return (
    <editorContext.Provider
      value={{
        blog,
        setBlog,
        isPublish,
        setIsPublish,
        textEditor,
        setTextEditor,
        isPublishClose,
        setIsPublishClose,
      }}
    >
      {children}
    </editorContext.Provider>
  );
};

export const useEditorContext = () => useContext(editorContext);
