import { Router } from "express";
import {
  createUser,
  getUserById,
  getUsers,
  updatePassword,
} from "../controllers/user.controller";
import { verifyToken } from "../middlewares";

export const userRouter = Router();

userRouter.get("/", getUsers);
userRouter.get("/:id", getUserById);
userRouter.post("/register", createUser);
userRouter.post("/changePassword", verifyToken, updatePassword);
