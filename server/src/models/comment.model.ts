import { Document, Schema, model } from "mongoose";

interface IComment extends Document {
  blogId: string; // ID of the blog post the comment belongs to
  blogAuthor: string; // ID of the blog author
  content: string; // Text of the comment
  commentedBy: string; // ID of the user who made the comment
  isReply: boolean; // Indicates if the comment is a reply to another comment
  parent?: string; // ID of the parent comment, if applicable
  children: string[]; // Array of child comment IDs
  commentedAt: Date; // Timestamp when the comment was created
  updatedAt: Date; // Timestamp when the comment was last updated
}

const commentSchema = new Schema(
  {
    blogId: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
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
    },
    children: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: {
      createdAt: "commentedAt",
      updatedAt: "updatedAt",
    },
  }
);

const Comment = model<IComment>("Comment", commentSchema);

export { Comment, IComment };
