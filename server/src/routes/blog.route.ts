import { Router } from "express";
import {
  createBlog,
  getLatestBlogs,
  getBlogById,
  updateReadCount,
} from "../controllers/blog.controller";
import { verifyToken } from "../middlewares";

export const blogRouter = Router();

// public routes
blogRouter.get("/", getLatestBlogs);
blogRouter.get("/:blogId", getBlogById);

// protected routes
blogRouter.post("/", verifyToken, createBlog);
blogRouter.patch("/:blogId/readCount", verifyToken, updateReadCount);
