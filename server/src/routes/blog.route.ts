import { Router } from "express";
import {
  createBlog,
  getLatestBlogs,
  getTrendingBlogs,
} from "../controllers/blog.controller";
import { verifyToken } from "../middlewares";

export const blogRouter = Router();

// public routes
blogRouter.get("/", getLatestBlogs);
blogRouter.get("/trending", getTrendingBlogs);

// protected routes
blogRouter.post("/", verifyToken, createBlog);
