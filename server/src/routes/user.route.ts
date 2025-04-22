import { Router } from "express";
import {
  createUser,
  getUserById,
  getUsers,
  updatePassword,
  updateUser,
  updateUsername,
} from "../controllers/user.controller";
import { verifyToken } from "../middlewares";

export const userRouter = Router();

userRouter.get("/", getUsers);
userRouter.patch("/", verifyToken, updateUser);

userRouter.get("/:id", getUserById);
userRouter.post("/register", createUser);
userRouter.post("/changePassword", verifyToken, updatePassword);
userRouter.patch("/changeUsername", verifyToken, updateUsername);
