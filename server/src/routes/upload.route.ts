import { Router } from "express";
import { uploadSingleImage } from "../controllers/upload.controller";

export const uploadRouter = Router();

uploadRouter.post("/", uploadSingleImage);
