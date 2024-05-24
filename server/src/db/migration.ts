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
      blog.activity = { totalLikes: 0, totalReads: 0 };
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
