import { IBlog } from "@/types";
import { ReactNode, createContext, useContext, useState } from "react";

type EditorContextType = {
  blog: IBlog;
  setBlog: React.Dispatch<React.SetStateAction<IBlog>>;
  isPublish: boolean;
  setIsPublish: React.Dispatch<React.SetStateAction<boolean>>;
};

const editorContext = createContext<EditorContextType>({} as EditorContextType);

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [blog, setBlog] = useState<IBlog>({} as IBlog);
  const [isPublish, setIsPublish] = useState<boolean>(false);

  return (
    <editorContext.Provider value={{ blog, setBlog, isPublish, setIsPublish }}>
      {children}
    </editorContext.Provider>
  );
};

export const useEditorContext = () => useContext(editorContext);
