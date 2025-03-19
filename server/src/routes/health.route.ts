import { Request, Response, Router } from "express";
import { checkDatabaseConnection } from "../db";

export const healthRouter = Router();

const getHealthStatus = (req: Request, res: Response) => {
  const { status, connectionState } = checkDatabaseConnection();

  res.status(status === "ok" ? 200 : 500).json({
    status,
    database: connectionState,
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
};

healthRouter.route("/").get(getHealthStatus);
