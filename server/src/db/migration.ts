import "dotenv/config";
import mongoose from "mongoose";
import { Blog } from "../models/blog.model";
import connectDB from ".";

connectDB();

const db = mongoose.connection;
db.once("open", async () => {
  try {
    // Find blogs without the activity field and update them
    const blogsToUpdate = await Blog.find({ activity: { $exists: false } });
    for (const blog of blogsToUpdate) {
      // Check if the activity field exists, if not, add it
      if (!blog.activity) {
        blog.activity = { totalLikes: 0, totalReads: 0 };
        await blog.save();
      }
    }
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    db.close();
  }
});
