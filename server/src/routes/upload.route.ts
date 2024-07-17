import { Router } from "express";
import { uploadSingleImage } from "../controllers/upload.controller";
import { verifyToken } from "../middlewares";

export const uploadRouter = Router();

uploadRouter.post("/", verifyToken, uploadSingleImage);
