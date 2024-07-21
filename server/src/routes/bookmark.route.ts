import { Router } from "express";
import { addBookmark } from "../controllers/bookmark.controller";
import { verifyToken } from "../middlewares";

export const bookmarkRouter = Router();

bookmarkRouter.post("/:blogId", verifyToken, addBookmark);
