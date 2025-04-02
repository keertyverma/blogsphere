import { Document, Schema, model } from "mongoose";
import { IBlog } from "./blog.model";

interface IComment extends Document {
  blogId: string | IBlog["_id"]; // ID of the blog post the comment belongs to
  blogAuthor: string; // ID of the blog author
  content: string; // Text of the comment
  commentedBy: string; // ID of the user who made the comment
  isReply: boolean; // Indicates if the comment is a reply to another comment
  totalReplies: number; // total nested replies count
  parent?: string; // ID of the parent comment, if applicable
  commentedAt: Date; // Timestamp when the comment was created
  updatedAt: Date; // Timestamp when the comment was last updated
  isEdited: boolean; //to track edited status
}

const commentSchema = new Schema(
  {
    blogId: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
      index: true, // Index on blogId field
    },
    blogAuthor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    commentedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isReply: {
      type: Boolean,
      default: false,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      index: true, // Index on parent field
    },
    totalReplies: {
      type: Number,
      default: 0,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "commentedAt",
      updatedAt: "updatedAt",
    },
  }
);

commentSchema.index({ commentedAt: -1 });

const Comment = model<IComment>("Comment", commentSchema);

export { Comment, IComment };
