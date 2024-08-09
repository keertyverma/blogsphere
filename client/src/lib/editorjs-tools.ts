import Embed from "@editorjs/embed";
import Header from "@editorjs/header";
import Image from "@editorjs/image";
import InlineCode from "@editorjs/inline-code";
import List from "@editorjs/list";
import Marker from "@editorjs/marker";
import Quote from "@editorjs/quote";
// import Code from "@editorjs/code";
import { fileToBase64 } from "./utils";
import apiClient from "./api-client";
import AceCodeEditorJS, { AceCodeConfig } from "ace-code-editorjs";
import ace from "ace-builds";
import "ace-builds/esm-resolver";

import modeHTMLWorker from "ace-builds/src-noconflict/worker-html?url";
import modeJSWorker from "ace-builds/src-noconflict/worker-javascript?url";
import modeCSSWorker from "ace-builds/src-noconflict/worker-css?url";
import modePHPWorker from "ace-builds/src-noconflict/worker-php?url";

ace.config.setModuleUrl("ace/mode/html_worker", modeHTMLWorker);
ace.config.setModuleUrl("ace/mode/javascript_worker", modeJSWorker);
ace.config.setModuleUrl("ace/mode/css_worker", modeCSSWorker);
ace.config.setModuleUrl("ace/mode/php_worker", modePHPWorker);

const aceConfig: AceCodeConfig = {
  languages: {
    plain: {
      label: "Plain Text",
      mode: "ace/mode/plain_text",
    },
    html: {
      label: "HTML",
      mode: "ace/mode/html",
    },
    javascript: {
      label: "JavaScript",
      mode: "ace/mode/javascript",
    },
    css: {
      label: "CSS",
      mode: "ace/mode/css",
    },
    php: {
      label: "PHP",
      mode: "ace/mode/php",
    },
    jsx: {
      label: "JSX",
      mode: "ace/mode/jsx",
    },
    tsx: {
      label: "TSX",
      mode: "ace/mode/tsx",
    },
    typescript: {
      label: "TypeScript",
      mode: "ace/mode/typescript",
    },
    sql: {
      label: "SQL",
      mode: "ace/mode/sql",
    },
  },
  options: {
    fontSize: 16,
    minLines: 4,
    theme: "ace/theme/monokai",
  },
};

const uploadImageByURL = async (e: string) => {
  let imageURL = null;

  const link = new Promise((resolve, reject) => {
    try {
      resolve(e);
    } catch (error) {
      reject(error);
    }
  });

  imageURL = await link;
  if (imageURL) {
    return { success: 1, file: { url: imageURL } };
  }

  return;
};

const uploadImage = async (img: File) => {
  let imgURL = null;

  // get base64 image string
  const base64EncodedImg = await fileToBase64(img);
  try {
    const result = await apiClient
      .post("/upload", { data: base64EncodedImg })
      .then((res) => res.data.result);
    imgURL = result.url;
  } catch (error) {
    console.error("Error in uploading file from editor. ", error);
  }

  return imgURL;
};

const uploadImageByFile = async (e: File) => {
  const url = await uploadImage(e);
  if (url) {
    return {
      success: 1,
      file: { url },
    };
  }
  return;
};

export const editorJSTools = {
  header: {
    class: Header,
    config: {
      placeholder: "Type Heading...",
      levels: [1, 2, 3, 4, 5, 6],
      defaultLevel: 2,
    },
  },
  list: {
    class: List,
    inlineToolbar: true,
  },
  image: {
    class: Image,
    config: {
      uploader: {
        uploadByUrl: uploadImageByURL,
        uploadByFile: uploadImageByFile,
      },
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
  },
  // code: Code,
  code: {
    class: AceCodeEditorJS,
    config: aceConfig,
  },
  marker: Marker,
  inlineCode: InlineCode,
  embed: Embed,
};
