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

// Customize 'toJSON' method to convert Map to plain object
bookmarkSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.blogId) {
      ret.blog = ret.blogId;
      delete ret.blogId;
    }
    return ret;
  },
});

const Bookmark = model<IBookmark>("Bookmark", bookmarkSchema);

export { Bookmark, IBookmark };
