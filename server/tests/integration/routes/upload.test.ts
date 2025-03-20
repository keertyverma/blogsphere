import "dotenv/config";
import { Server } from "http";
import { disconnect } from "mongoose";
import request from "supertest";
import { Application } from "express";

import { startServer } from "../../../src/start";
import { User } from "../../../src/models/user.model";
import * as cloudinary from "../../../src/utils/cloudinary";
import BadRequestError from "../../../src/utils/errors/bad-request";

let server: Server;
let app: Application; // Express instance
let endpoint: string = `/api/v1/upload/`;

describe("/api/v1/upload", () => {
  let token: string;

  beforeAll(async () => {
    try {
      ({ server, app } = await startServer());
    } catch (error) {
      console.error("🚨 Server startup failed in tests:", error);
      throw new Error("Failed to start the test server");
    }
  });

  afterAll(async () => {
    if (server) server.close();
    await disconnect();
  });

  beforeEach(() => {
    const user = new User();
    token = user.generateAuthToken();
  });

  afterEach(async () => {
    // db cleanup
    await User.deleteMany({});
  });

  describe("POST /", () => {
    const exec = async (payload: any = {}) => {
      return await request(app)
        .post(endpoint)
        .set("Cookie", `authToken=${token}`)
        .send(payload);
    };

    it("should return UnAuthorized-401 if user is not authorized", async () => {
      // token cookie is not set
      token = "";

      const res = await exec();

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toMatchObject({
        code: "UNAUTHORIZED",
        message: "Unauthorized access.",
        details: "Access Denied.Token is not provided.",
      });
    });

    it("should return BadRequest-400 if token is invalid", async () => {
      token = "invalid token";

      const res = await exec({ data: "invalid-data" });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Invalid auth token.",
      });
    });

    it("should return BadRequest-400 if data format is invalid", async () => {
      const res = await exec({ data: "invalid-data" });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Invalid data URI format. It must be encoded in base64",
      });
    });

    it("should return BadRequest-400 if file data is invalid", async () => {
      // Mock uploadSecurely function to return mocked error
      jest
        .spyOn(cloudinary, "uploadSecurely")
        .mockRejectedValue(new BadRequestError("Invalid image file"));

      const data =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB4AAAAQ4CAYAAADo08FDAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAEXRSURBVHgB7N39jhRXnufhMEZG0HiqVAgE07SxQCAj8cdewu6V7N5Jz17J7t7JXkMLhGVkDG4skBEl14BBWGDvfNMb7uqaqoyTL5Evv3oeKadok5VVkfHicX7inPNJ9";
      const res = await exec({ data });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Invalid image file",
      });
    });

    it("should return 201 if data is valid and upload is successful", async () => {
      // Mock uploadSecurely function to return mocked uploaded url
      const mockedUploadedImgURL = "https://res.cloudinary.com/sample.png";
      jest
        .spyOn(cloudinary, "uploadSecurely")
        .mockResolvedValue(mockedUploadedImgURL);

      const data =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB4AAAAQ4CAYAAADo08FDAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAEXRSURBVHgB7N39jhRXnufhMEZG0HiqVAgE07SxQCAj8cdewu6V7N5Jz17J7t7JXkMLhGVkDG4skBEl14BBWGDvfNMb7uqaqoyTL5Evv3oeKadok5VVkfHicX7inPNJ9";
      const res = await exec({ data });

      expect(res.statusCode).toBe(201);
      const {
        status,
        statusCode,
        result: { url },
      } = res.body;

      expect(status).toBe("success");
      expect(statusCode).toBe(201);
      expect(url).toBe(mockedUploadedImgURL);
    });
  });
});
