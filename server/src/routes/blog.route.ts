import { Router } from "express";
import {
  createBlog,
  deleteBlogByBlogId,
  generateBlogAIMetadata,
  getAllDraftBlogs,
  getAllPublishedBlogs,
  getDraftBlogById,
  getPublishedBlogById,
  updateBlogById,
  updateLike,
  updateReadCount,
} from "../controllers/blog.controller";
import { verifyToken } from "../middlewares";
import {
  aiMetadataGlobalRateLimiter,
  aiMetadataPerUserRateLimiter,
} from "../middlewares/rate-limit-middleware";

export const blogRouter = Router();

/**
 * Order matters here: Specific routes (e.g., /drafts) should be registered before Dynamic routes (e.g, /:blogId)
 */

/**
 * Protected Routes
 * These routes require authentication.
 */
blogRouter.post("/", verifyToken, createBlog); // Create a new blog
blogRouter.get("/drafts", verifyToken, getAllDraftBlogs); // Fetch all draft blogs for the authenticated user
blogRouter.get("/drafts/:blogId", verifyToken, getDraftBlogById);
blogRouter.patch("/:blogId", verifyToken, updateBlogById); // Update a blog by its ID
blogRouter.patch("/:blogId/readCount", verifyToken, updateReadCount); // Increment read count for a blog
blogRouter.patch("/:blogId/like", verifyToken, updateLike); // Like or unlike a blog
blogRouter.delete("/:blogId", verifyToken, deleteBlogByBlogId); // Delete a blog by its ID
blogRouter.post(
  "/ai-metadata",
  verifyToken,
  aiMetadataGlobalRateLimiter,
  aiMetadataPerUserRateLimiter,
  generateBlogAIMetadata
); // Generate blog metadata using AI

/**
 * Public Routes
 * These routes are accessible without authentication.
 */
blogRouter.get("/", getAllPublishedBlogs); // Fetch all published blogs
blogRouter.get("/:blogId", getPublishedBlogById); // Fetch a specific blog by its ID
