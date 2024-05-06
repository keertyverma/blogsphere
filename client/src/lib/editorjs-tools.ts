import Embed from "@editorjs/embed";
import Header from "@editorjs/header";
import Image from "@editorjs/image";
import InlineCode from "@editorjs/inline-code";
import List from "@editorjs/list";
import Marker from "@editorjs/marker";
import Quote from "@editorjs/quote";

export const editorJSTools = {
  header: {
    class: Header,
    config: {
      placeholder: "Type Heading...",
      levels: [1, 2, 3, 4, 5, 6],
      defaultLevel: 2,
    },
  },
  list: List,
  image: Image,
  quote: Quote,
  marker: Marker,
  inlineCode: InlineCode,
  embed: Embed,
};
