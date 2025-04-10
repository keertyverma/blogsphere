import Embed from "@editorjs/embed";
import Header from "@editorjs/header";
import Image from "@editorjs/image";
import InlineCode from "@editorjs/inline-code";
import EditorjsList from "@editorjs/list";
import Marker from "@editorjs/marker";
import Paragraph from "@editorjs/paragraph";
import Quote from "@editorjs/quote";

import {
  CustomEditorJsCodeBlock,
  languageSelectionMap,
} from "./custom-editorjs-code-block";
import { uploadImageByFile, uploadImageByURL } from "./editorjs-upload-utils";

export const editorJSTools = {
  header: {
    class: Header,
    config: {
      placeholder: "Heading...",
      levels: [1, 2, 3, 4, 5, 6],
      defaultLevel: 2,
    },
  },
  paragraph: {
    class: Paragraph,
    inlineToolbar: true,
    config: {
      preserveBlank: true,
    },
  },
  list: {
    class: EditorjsList,
    inlineToolbar: true,
    config: {
      counterTypes: ["numeric"],
    },
  },
  image: {
    class: Image,
    inlineToolbar: true,
    config: {
      types: "image/*",
      uploader: {
        uploadByUrl: uploadImageByURL,
        uploadByFile: uploadImageByFile,
      },
      features: {
        caption: "optional",
        border: false,
        stretch: true,
      },
      captionPlaceholder: "Add a caption",
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
  },
  code: {
    class: CustomEditorJsCodeBlock,
    config: {
      languages: languageSelectionMap,
    },
  },
  marker: Marker,
  inlineCode: InlineCode,
  embed: Embed,
};
