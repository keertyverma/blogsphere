import { Router } from "express";
import {
  createComment,
  getAllComments,
} from "../controllers/comment.controller";
import { verifyToken } from "../middlewares";

export const commentRouter = Router();

commentRouter.route("/").get(getAllComments).post(verifyToken, createComment);
