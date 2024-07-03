import { Router } from "express";
import {
  createComment,
  getAllComments,
  createReply,
} from "../controllers/comment.controller";
import { verifyToken } from "../middlewares";

export const commentRouter = Router();

commentRouter.route("/").get(getAllComments).post(verifyToken, createComment);
commentRouter.route("/replies").post(verifyToken, createReply);
