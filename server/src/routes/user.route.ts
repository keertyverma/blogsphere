import { Router } from "express";
import { createUser, getUsers } from "../controllers/user.controller";

export const userRouter = Router();

userRouter.get("/", getUsers);
userRouter.post("/register", createUser);
