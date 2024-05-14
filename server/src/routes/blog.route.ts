import { Router } from "express";
import { createBlog, getLatestBlogs } from "../controllers/blog.controller";
import { verifyToken } from "../middlewares";

export const blogRouter = Router();

// public routes
blogRouter.get("/latest", getLatestBlogs);

// protected routes
blogRouter.post("/", verifyToken, createBlog);
