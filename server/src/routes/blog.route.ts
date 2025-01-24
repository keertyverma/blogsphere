import { Router } from "express";
import {
  createBlog,
  deleteBlogByBlogId,
  getBlogById,
  getAllPublishedBlogs,
  updateBlogById,
  updateLike,
  updateReadCount,
} from "../controllers/blog.controller";
import { verifyToken } from "../middlewares";

export const blogRouter = Router();

// public routes
blogRouter.get("/", getAllPublishedBlogs);
blogRouter.get("/:blogId", getBlogById);

// protected routes
blogRouter.post("/", verifyToken, createBlog);
blogRouter.patch("/:blogId", verifyToken, updateBlogById);
blogRouter.patch("/:blogId/readCount", verifyToken, updateReadCount);
blogRouter.patch("/:blogId/like", verifyToken, updateLike);
blogRouter.delete("/:blogId", verifyToken, deleteBlogByBlogId);
