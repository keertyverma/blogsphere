import { Router } from "express";
import {
  authenticateUser,
  authenticateWithGoogle,
  forgotPassword,
  logout,
  resendVerification,
  resetPassword,
  verifyEmail,
} from "../controllers/auth.controller";
import { resendEmailRateLimiter, verifyToken } from "../middlewares";

export const authRouter = Router();

authRouter.post("/", authenticateUser);
authRouter.post("/google-auth", authenticateWithGoogle);
authRouter.post("/logout", verifyToken, logout);
authRouter.post("/verify-email", verifyEmail);
authRouter.post(
  "/resend-verification",
  resendEmailRateLimiter,
  resendVerification
);
authRouter.post("/forgot-password", resendEmailRateLimiter, forgotPassword);
authRouter.post("/reset-password", resetPassword);
