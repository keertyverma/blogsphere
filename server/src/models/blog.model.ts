import { Document, Schema, model } from "mongoose";
import { IUser } from "./user.model";

interface IBlog extends Document {
  blogId: string;
  title: string;
  description: string;
  content: {
    blocks: [];
  };
  coverImgURL: string;
  tags: string[];
  author: string | IUser["_id"];
  isDraft: boolean;
  activity: {
    totalLikes: number;
    totalReads: number;
    totalComments: number;
    totalParentComments: number;
  };
  likes: Map<string, boolean>;
  comments: string[];
}

const blogSchema = new Schema(
  {
    blogId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxlength: 200,
    },
    content: {
      blocks: { type: Array },
    },
    coverImgURL: {
      type: String,
    },
    tags: {
      type: [String],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDraft: {
      type: Boolean,
      required: true,
    },
    activity: {
      totalLikes: { type: Number, default: 0 },
      totalReads: { type: Number, default: 0 },
      totalComments: { type: Number, default: 0 },
      totalParentComments: { type: Number, default: 0 },
    },
    likes: {
      type: Map,
      of: Boolean,
      default: {},
    },
  },
  { timestamps: true }
);

// Customize 'toJSON' method to convert Map to plain object
blogSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.likes instanceof Map) {
      ret.likes = Object.fromEntries(ret.likes);
    }
    if (ret.author) {
      ret.authorDetails = ret.author;
      delete ret.author;
    }
    return ret;
  },
});

const Blog = model<IBlog>("Blog", blogSchema);

export { Blog, IBlog };
