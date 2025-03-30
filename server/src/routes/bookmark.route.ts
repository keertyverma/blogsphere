import { Router } from "express";
import {
  addBookmark,
  getBookmarksForUser,
  removeBookmark,
} from "../controllers/bookmark.controller";
import { verifyToken } from "../middlewares";

export const bookmarkRouter = Router();

bookmarkRouter.post("/:blogId", verifyToken, addBookmark);
bookmarkRouter.delete("/:blogId", verifyToken, removeBookmark);
bookmarkRouter.get("/user", verifyToken, getBookmarksForUser);
