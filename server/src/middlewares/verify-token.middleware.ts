import config from "config";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";

// Extend the Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
    }
  }
}

// Authorization middleware
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // check auth token in request header.Valid auth header - Bearer <token>
  const authHeader = req.header("authorization");
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send("Access Denied.Token is not provided.");
  }

  // verify token
  try {
    // decode auth token and store payload in req.user
    req.user = jwt.verify(token, config.get("secretAccessKey"));
    next();
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).send("Invalid token.");
  }
};
