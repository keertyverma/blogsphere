import config from "config";
import { NextFunction, Request, Response } from "express";
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
  // get token from request cookies
  const token = req.cookies?.authToken;
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
    if (error instanceof jwt.TokenExpiredError) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send("Token has expired. Please log in again.");
    }

    return res.status(StatusCodes.BAD_REQUEST).send("Invalid token.");
  }
};
