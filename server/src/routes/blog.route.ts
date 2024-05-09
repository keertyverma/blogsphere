import { Router } from "express";
import { createBlog } from "../controllers/blog.controller";

export const blogRouter = Router();

blogRouter.post("/", createBlog);
