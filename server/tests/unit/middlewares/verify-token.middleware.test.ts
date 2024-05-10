import { NextFunction, Request, Response } from "express";
import { User } from "../../../src/models/user.model";
import { verifyToken } from "../../../src/middlewares";

describe("verify token middleware", () => {
  it("should populate req.user with the payload of a valid JWT", () => {
    const user = new User();
    const token = user.generateAuthToken();
    const req = {
      header: jest.fn().mockReturnValue(`Bearer ${token}`),
    } as unknown as Request;
    const res = {} as Response;
    const next: jest.Mock<NextFunction> = jest.fn();

    verifyToken(req, res, next);

    expect(req.user).toMatchObject({ id: user.id });
  });
});
