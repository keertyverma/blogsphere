import { Schema, model } from "mongoose";

interface IBlog {
  blogId: string;
  title: string;
  description: string;
  content: [];
  coverImgURL: string;
  tags: string[];
  author: string;
  isDraft: boolean;
  activity: {
    totalLikes: number;
    totalReads: number;
  };
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
      type: Array,
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
    },
  },
  { timestamps: true }
);

const Blog = model<IBlog>("Blog", blogSchema);

export { IBlog, Blog };
