import Embed from "@editorjs/embed";
import Header from "@editorjs/header";
import Image from "@editorjs/image";
import InlineCode from "@editorjs/inline-code";
import List from "@editorjs/list";
import Marker from "@editorjs/marker";
import Quote from "@editorjs/quote";
import { fileToBase64 } from "./utils";
import apiClient from "./api-client";

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
    const res = await apiClient
      .post("/upload", { data: base64EncodedImg })
      .then((res) => res.data);

    imgURL = res.data.url;
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
  marker: Marker,
  inlineCode: InlineCode,
  embed: Embed,
};
