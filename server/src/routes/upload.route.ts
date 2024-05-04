import { Router } from "express";
import { uploadSingleImage } from "../controllers/upload.controller";

const router = Router();

router.post("/", uploadSingleImage);

export default router;
