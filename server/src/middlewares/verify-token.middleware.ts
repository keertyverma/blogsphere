import config from "config";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";
import BadRequestError from "../utils/errors/bad-request";
import CustomAPIError from "../utils/errors/custom-api";

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
    throw new CustomAPIError(
      "Access Denied.Token is not provided.",
      StatusCodes.UNAUTHORIZED
    );
  }

  // verify token
  try {
    // decode auth token and store payload in req.user
    req.user = jwt.verify(token, config.get("secretAccessKey"));
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      // Allow requests to the logout route to continue even if the token has expired.
      if (req.path === "/logout") {
        return next();
      }

      throw new CustomAPIError(
        "Token has expired. Please log in again.",
        StatusCodes.UNAUTHORIZED
      );
    }

    throw new BadRequestError("Invalid auth token.");
  }
};
