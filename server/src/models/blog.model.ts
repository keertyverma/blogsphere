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
}

const blogSchema = new Schema(
  {
    blogId: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
      index: true,
    },
    isDraft: {
      type: Boolean,
      required: true,
      index: true,
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

// Create a compound index on `createdAt` and `_id` in descending order to optimize cursor-based pagination
// by efficiently sorting documents based on creation date and document ID.
blogSchema.index({ createdAt: -1, _id: -1 });

// Virtual field to populate the 'authorDetails' for a blog
blogSchema.virtual("authorDetails", {
  ref: "User",
  localField: "author",
  foreignField: "_id",
  justOne: true, // Each blog has only one author, so there's no need for an array.
});

const Blog = model<IBlog>("Blog", blogSchema);

export { Blog, IBlog };
