import "dotenv/config";
import mongoose from "mongoose";
import { Blog } from "../models/blog.model";
import { connectDB } from ".";
import { User } from "../models/user.model";
import { Comment } from "../models/comment.model";

connectDB();

const db = mongoose.connection;
db.once("open", async () => {
  try {
    // await addPublishedAtFieldToBlog();
    // await addLastEditedAtFieldToBlog();
    await removeBlogsFieldFromUser();
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    db.close();
  }
});

const removeBlogsFieldFromUser = async () => {
  // Remove 'blogs' field from all users
  const result = await User.updateMany({}, { $unset: { blogs: 1 } });
  console.log(
    `Modified ${result.modifiedCount} user(s): Removed 'blogs' field.`
  );
};

const addLastEditedAtFieldToBlog = async () => {
  // Find all blogs where 'lastEditedAt' field is missing and set it to 'createdAt' timestamp.
  await Blog.updateMany({ lastEditedAt: { $exists: false } }, [
    { $set: { lastEditedAt: "$createdAt" } },
  ]);
};

const addPublishedAtFieldToBlog = async () => {
  // Locate blogs missing the 'publishedAt' field.
  // For published blogs, set 'publishedAt' to 'createdAt'.
  // For draft blogs, explicitly set 'publishedAt' to null.
  await Blog.updateMany({ publishedAt: { $exists: false } }, [
    {
      $set: {
        publishedAt: {
          $cond: {
            if: "$isDraft",
            then: null,
            else: "$createdAt",
          },
        },
      },
    },
  ]);
};

const addActivityFieldToBlog = async () => {
  // Find blogs without the 'activity' field and update them
  const blogsToUpdate = await Blog.find({ activity: { $exists: false } });
  for (const blog of blogsToUpdate) {
    // Check if the activity field exists, if not, add it
    if (!blog.activity) {
      blog.activity = {
        totalLikes: 0,
        totalReads: 0,
        totalComments: 0,
        totalParentComments: 0,
      };
      await blog.save();
    }
  }
};

const addSocialLinksFieldToUser = async () => {
  // Find users without the 'socialLinks' field and update them
  const users = await User.find({ socialLinks: { $exists: false } });
  for (const user of users) {
    user.socialLinks = {
      youtube: "",
      instagram: "",
      facebook: "",
      twitter: "",
      github: "",
      website: "",
    };
    await user.save();
  }
};

const updateContentFieldType = async () => {
  // Change content from array to object
  const blogs = await Blog.find({ isDraft: false });
  for (const blog of blogs) {
    // Ensure the content block is treated as an array
    let contentArray: any[];
    if (!Array.isArray(blog.content.blocks)) {
      contentArray = [blog.content.blocks];
    } else {
      contentArray = blog.content.blocks;
    }

    if (Array.isArray(contentArray) && contentArray.length > 0) {
      const newContent = { blocks: contentArray[0] };
      blog.content = newContent;
      await blog.save();
      console.log(`Updated content for blog with id: ${blog._id}`);
    }
  }
};

const addLikesFieldToBlog = async () => {
  // Find blogs without the 'likes' field and set it to empty Map
  const blogsToUpdate = await Blog.find({ likes: { $exists: false } });
  for (const blog of blogsToUpdate) {
    if (!blog.likes) {
      blog.likes = new Map<string, boolean>();
      await blog.save();
    }
  }
};

const deleteCommentsFieldOnBlog = async () => {
  // fing blog where 'comments' field is set and remove it.
  await Blog.updateMany({}, { $unset: { comments: 1 } });
};

const _incrementalTotalReplies = async (commentId: string) => {
  const parentComment = await Comment.findByIdAndUpdate(
    commentId,
    { $inc: { totalReplies: 1 } },
    { new: true }
  );

  if (parentComment?.parent) {
    await _incrementalTotalReplies(parentComment.parent);
  }
};

const updateCommentsSchema = async () => {
  // Set default value for totalReplies in all documents
  await Comment.updateMany(
    { totalReplies: { $exists: false } },
    { $set: { totalReplies: 0 } }
  );

  // remove 'children' field
  await Comment.updateMany(
    { children: { $exists: true } },
    { $unset: { children: 1 } }
  );

  // add 'isEdited' field and set it to 'false' by default
  await Comment.updateMany(
    { isEdited: { $exists: false } },
    { $set: { isEdited: false } }
  );
};
