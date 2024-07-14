import { Router } from "express";
import {
  authenticateUser,
  authenticateWithGoogle,
  logout,
} from "../controllers/auth.controller";
import { verifyToken } from "../middlewares";

export const authRouter = Router();

authRouter.post("/", authenticateUser);
authRouter.post("/google-auth", authenticateWithGoogle);
authRouter.post("/logout", verifyToken, logout);
