import { Router } from "express";
import {
  authenticateUser,
  authenticateWithGoogle,
} from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/", authenticateUser);
authRouter.post("/google-auth", authenticateWithGoogle);
