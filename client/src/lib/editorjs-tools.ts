import Embed from "@editorjs/embed";
import Header from "@editorjs/header";
import Image from "@editorjs/image";
import InlineCode from "@editorjs/inline-code";
import List from "@editorjs/list";
import Marker from "@editorjs/marker";
import Quote from "@editorjs/quote";
import Code from "@editorjs/code";
import { fileToBase64 } from "./utils";
import apiClient from "./api-client";
import CodeBox from "@bomdi/codebox";

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
  code: Code,
  codeBox: {
    class: CodeBox,
    config: {
      themeURL:
        "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.18.1/build/styles/dracula.min.css", // Optional
      themeName: "atom-one-dark", // Optional
      useDefaultTheme: "dark", // Optional. This also determines the background color of the language select drop-down
    },
  },
  marker: Marker,
  inlineCode: InlineCode,
  embed: Embed,
};
