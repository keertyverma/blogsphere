import { Router } from "express";
import {
  authenticateUser,
  authenticateWithGoogle,
} from "../controllers/auth.controller";

const router = Router();

router.post("/", authenticateUser);
router.post("/google-auth", authenticateWithGoogle);

export default router;
