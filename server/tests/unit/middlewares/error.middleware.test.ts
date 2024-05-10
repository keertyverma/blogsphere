import { NextFunction, Request, Response } from "express";
import { Error as MongooseError } from "mongoose";

import { errorHandler } from "../../../src/middlewares";
import NotFoundError from "../../../src/utils/errors/not-found";
import BadRequestError from "../../../src/utils/errors/bad-request";
import CustomAPIError from "../../../src/utils/errors/custom-api";

describe("Error Handler Middleware Test Suite", () => {
  let req: Request;
  let res: Response;
  let next: jest.Mock<NextFunction>;

  beforeEach(() => {
    // create mock for request, response object and next function.
    req = {} as Request;
    res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    } as unknown as Response;
    next = jest.fn();
  });

  test("should set response status to 400 in case of bad request error", () => {
    const statusCode = 400;
    const errorMessage = `\"name\" is required`;
    const expectedResponse = {
      status: "error",
      statusCode: statusCode,
      error: {
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: errorMessage,
      },
    };
    const error = new BadRequestError(errorMessage);

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(statusCode);
    expect(res.send).toHaveBeenCalledWith(expectedResponse);
  });

  test("should set response status to 404 in case of not found error", () => {
    const statusCode = 404;
    const errorMessage = "Genre Ids = 65f416548a2e025cc9ff090d are not found";
    const expectedResponse = {
      status: "error",
      statusCode: statusCode,
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: errorMessage,
      },
    };
    const error = new NotFoundError(errorMessage);

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(statusCode);
    expect(res.send).toHaveBeenCalledWith(expectedResponse);
  });

  test("should set response status to 400 in case of mongoose validation error", () => {
    const statusCode = 400;
    const expectedResponse = {
      status: "error",
      statusCode: statusCode,
      error: {
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: `\"name\" is required`,
      },
    };

    const mongooseValidationError = new MongooseError.ValidationError();
    mongooseValidationError.message = "Validation failed";
    mongooseValidationError.errors["fieldName"] =
      new MongooseError.ValidatorError({
        message: `\"name\" is required`,
        path: "name",
        value: undefined, // Since it's missing
      });

    errorHandler(mongooseValidationError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(statusCode);
    expect(res.send).toHaveBeenCalledWith(expectedResponse);
  });

  test("should set response status to 400 in case of mongoose duplicate key error", () => {
    const statusCode = 400;
    const expectedResponse = {
      status: "error",
      statusCode: statusCode,
      error: {
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details:
          "Duplicate value entered for 'name' field, please choose another value",
      },
    };

    const duplicateKeyError = new MongooseError(
      "Duplicate key error occurred"
    ) as any;
    duplicateKeyError.code = 11000;
    duplicateKeyError.keyValue = { name: "name" };

    errorHandler(duplicateKeyError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(statusCode);
    expect(res.send).toHaveBeenCalledWith(expectedResponse);
  });

  test("should set response status to 500 in case of any other issue with api", () => {
    const statusCode = 500;
    const expectedResponse = {
      status: "error",
      statusCode: statusCode,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message:
          "An unexpected error occurred on the server. Please try again later",
        details: "Something went wrong",
      },
    };
    const error = new Error("something just not working....");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(statusCode);
    expect(res.send).toHaveBeenCalledWith(expectedResponse);
  });

  test("should set response status to 403 in case of forbidden request", () => {
    const statusCode = 403;
    const errorMessage =
      "This email address was registered without using Google sign-in. Please use your password to log in and access the account.";
    const expectedResponse = {
      status: "error",
      statusCode: statusCode,
      error: {
        code: "FORBIDDEN",
        message: "You do not have permission to access this resource.",
        details: errorMessage,
      },
    };
    const error = new CustomAPIError(errorMessage, statusCode);

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(statusCode);
    expect(res.send).toHaveBeenCalledWith(expectedResponse);
  });
});
