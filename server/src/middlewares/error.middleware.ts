import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { Error as MongooseError } from "mongoose";

import {
  APIResponse,
  APIStatus,
  IErrorCodeMessageMap,
} from "../types/api-response";
import CustomAPIError from "../utils/errors/custom-api";
import logger from "../utils/logger";

export const errorHandler = (
  err: MongooseError | CustomAPIError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.debug(`${err}`);

  const errorCodeMessageMap: IErrorCodeMessageMap = {
    400: { code: "BAD_REQUEST", message: "Invalid input data" },
    401: { code: "UNAUTHORIZED", message: "Unauthorized access." },
    403: {
      code: "FORBIDDEN",
      message: "You do not have permission to access this resource.",
    },
    404: {
      code: "RESOURCE_NOT_FOUND",
      message: "The requested resource was not found.",
    },
    500: {
      code: "INTERNAL_SERVER_ERROR",
      message:
        "An unexpected error occurred on the server. Please try again later",
    },
    502: {
      code: "BAD_GATEWAY",
      message:
        "The server encountered an error while communicating with the AI service.",
    },
  };

  const customError = {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    details: "Something went wrong",
  };

  // Handle invalid JSON errors thrown by express.json()
  if (err instanceof SyntaxError && "body" in err) {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.details = `Invalid JSON format in ${req.method} ${req.url}. Please check your request payload.`;
  } else if (err instanceof CustomAPIError) {
    customError.statusCode = err.statusCode;
    customError.details = err.message;
  } else if (err instanceof MongooseError.ValidationError) {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.details = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
  } else if (err instanceof MongooseError.CastError) {
    customError.statusCode = StatusCodes.NOT_FOUND;
    customError.details = `No resource was found with id = ${err.value}`;
  } else if ((err as any).code === 11000) {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.details = `Duplicate value entered for '${Object.keys(
      (err as any).keyValue
    )}' field, please choose another value`;
  }

  const mappedError = errorCodeMessageMap[customError.statusCode];
  const errorResponse: APIResponse = {
    status: APIStatus.ERROR,
    statusCode: customError.statusCode,
    error: {
      code: mappedError.code,
      message: mappedError.message,
      details: customError.details,
    },
  };

  res.status(customError.statusCode).json(errorResponse);
};
