import { OutputData } from "@editorjs/editorjs";
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../db";
import { Blog } from "../models/blog.model";
import { User } from "../models/user.model";
import {
  deleteUploadedImages,
  getAllUploadedImages,
  getPublicIdFromUrl,
} from "./cloudinary";

connectDB();
const db = mongoose.connection;

db.once("open", async () => {
  console.log("----------------------------------------------");
  // Cleanup unused images
  // Delete images which are not associated with any blog or user
  try {
    await cleanupUnusedImages();
  } catch (error) {
    console.error("Cleanup failed:", error);
  } finally {
    db.close();
  }
  console.log("----------------------------------------------");
});

const getAllUsedDBImages = async (): Promise<Set<string>> => {
  const usedImagesPublicIds = new Set<string>();

  // Fetch blogs and users concurrently
  const [blogs, users] = await Promise.all([
    Blog.find().select("coverImgURL content"),
    User.find().select("personalInfo"),
  ]);

  // get blogs images
  blogs.forEach((blog) => {
    if (blog.coverImgURL) {
      const coverImg = getPublicIdFromUrl(blog.coverImgURL);
      if (coverImg) usedImagesPublicIds.add(coverImg);
    }

    const content: OutputData = blog.content;
    if (content) {
      content.blocks
        .filter((b) => b.type === "image")
        .forEach((block) => {
          const contentImg = getPublicIdFromUrl(block.data.file.url);
          if (contentImg) usedImagesPublicIds.add(contentImg);
        });
    }
  });

  // get user profile images
  users.forEach((user) => {
    if (user.personalInfo.profileImage) {
      const userProfileImg = getPublicIdFromUrl(user.personalInfo.profileImage);
      if (userProfileImg) usedImagesPublicIds.add(userProfileImg);
    }
  });

  return usedImagesPublicIds;
};

const cleanupUnusedImages = async () => {
  const usedImages = await getAllUsedDBImages();
  console.log(
    "# DB used images = ",
    usedImages.size,
    "\n used images = ",
    usedImages,
    "----------------------------------------------"
  );

  // get all images uploaded in cloudinary
  const uploadedImages = await getAllUploadedImages();
  console.log(
    "# Cloudinary uploaded images = ",
    uploadedImages.length,
    "\n uploadedImages = ",
    uploadedImages.map((i: any) => i.public_id),
    "----------------------------------------------"
  );

  // find out which images are not used by blog or user
  const unusedImages = uploadedImages
    .filter((image: any) => !usedImages.has(image.public_id))
    .map((image: any) => image.public_id);

  if (unusedImages.length === 0) {
    return console.log("🥳 No unused images found 😎");
  }
  //   console.log(
  //     "# Cloudinary unused images = ",
  //     unusedImages.length,
  //     "\n unusedImages = ",
  //     unusedImages
  //   );

  //  delete unused images
  const results = await deleteUploadedImages(unusedImages);

  let deletedImages: string[] = [];
  let notFoundImages: string[] = [];
  Object.entries(results.deleted).forEach(([id, status]) => {
    if (status === "deleted") {
      deletedImages.push(id);
    } else if (status === "not_found") {
      notFoundImages.push(id);
    }
  });

  if (deletedImages.length > 0) {
    console.log(` ✅ Deleted total = ${deletedImages.length} images.`);
    console.log("----------------------------------------------");
    console.log(deletedImages);
  }

  if (notFoundImages.length > 0) {
    console.error(
      `❌ Unable to delete the following ${notFoundImages.length} images as they were not found:`
    );
    console.log("----------------------------------------------");
    console.log(notFoundImages);
  }
};
