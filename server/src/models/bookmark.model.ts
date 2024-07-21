import { Document, Schema, model } from "mongoose";
import { IBlog } from "./blog.model";
import { IUser } from "./user.model";

interface IBookmark extends Document {
  blogId: IBlog["_id"]; // _id of the blog
  userId: IUser["_id"]; // _id of user
}

const bookmarkSchema = new Schema(
  {
    blogId: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
      index: true, // Index on blogId field
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index on userId field
    },
  },
  { timestamps: true }
);

const Bookmark = model<IBookmark>("Bookmark", bookmarkSchema);

export { Bookmark, IBookmark };
