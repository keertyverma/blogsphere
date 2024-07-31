import { Router } from "express";
import {
  authenticateUser,
  authenticateWithGoogle,
  logout,
  verifyEmail,
} from "../controllers/auth.controller";
import { verifyToken } from "../middlewares";

export const authRouter = Router();

authRouter.post("/", authenticateUser);
authRouter.post("/google-auth", authenticateWithGoogle);
authRouter.post("/logout", verifyToken, logout);
authRouter.post("/verify-email", verifyEmail);
