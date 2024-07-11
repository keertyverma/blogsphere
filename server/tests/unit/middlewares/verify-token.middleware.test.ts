import config from "config";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { verifyToken } from "../../../src/middlewares";
import { User } from "../../../src/models/user.model";

describe("verify token middleware", () => {
  it("should populate req.user with the payload of a valid JWT from cookie", () => {
    const user = new User();
    const token = user.generateAuthToken();
    const req = {
      cookies: {
        authToken: token,
      },
    } as unknown as Request;
    const res = {} as Response;
    const next: jest.Mock<NextFunction> = jest.fn();

    verifyToken(req, res, next);

    expect(req.user).toMatchObject({ id: user.id });
  });

  it("should return 401-UnAuthorized and access denied if token is not passed", async () => {
    const req = {} as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
    const next: jest.Mock<NextFunction> = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(
      "Access Denied.Token is not provided."
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401-UnAuthorized if token has expired", async () => {
    const expiredToken = jwt.sign(
      { id: "expiredUserId" },
      config.get("secretAccessKey") as string,
      {
        expiresIn: "-1s",
      }
    );

    const req = {
      cookies: {
        authToken: expiredToken,
      },
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
    const next: jest.Mock<NextFunction> = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(
      "Token has expired. Please log in again."
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 400-BadRequest if token is invalid", async () => {
    const req = {
      cookies: {
        authToken: "invalid Token",
      },
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
    const next: jest.Mock<NextFunction> = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Invalid token.");
    expect(next).not.toHaveBeenCalled();
  });
});
