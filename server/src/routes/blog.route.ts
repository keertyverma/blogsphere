import { Router } from "express";
import { createBlog } from "../controllers/blog.controller";
import { verifyToken } from "../middlewares";

export const blogRouter = Router();

blogRouter.post("/", verifyToken, createBlog);
