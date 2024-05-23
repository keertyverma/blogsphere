import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
} from "../controllers/user.controller";

export const userRouter = Router();

userRouter.get("/", getUsers);
userRouter.get("/:id", getUserById);
userRouter.post("/register", createUser);
