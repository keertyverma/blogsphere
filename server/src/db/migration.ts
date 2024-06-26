import "dotenv/config";
import mongoose from "mongoose";
import { Blog } from "../models/blog.model";
import connectDB from ".";
import { User } from "../models/user.model";

connectDB();

const db = mongoose.connection;
db.once("open", async () => {
  try {
    await addActivityFieldToBlog();
    await addSocialLinksFieldToUser();
    //  await updateContentFieldType();
    await addLikesFieldToBlog();

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    db.close();
  }
});

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
