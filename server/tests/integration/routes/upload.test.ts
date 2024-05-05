import "dotenv/config";
import config from "config";
import http from "http";
import { disconnect } from "mongoose";
import request from "supertest";

import appServer from "../../../src";
import * as cloudinary from "../../../src/utils/cloudinary";
import BadRequestError from "../../../src/utils/errors/bad-request";

let server: http.Server;
let endpoint: string = `/${config.get("appName")}/api/v1/upload/`;

describe("/api/v1/upload", () => {
  afterAll(async () => {
    // close the MongoDB connection
    await disconnect();
  });

  beforeEach(() => {
    server = appServer;
  });

  afterEach(async () => {
    server.close();
  });

  describe("POST /", () => {
    it("should return BadRequest-400 if data format is invalid", async () => {
      const res = await request(server)
        .post(endpoint)
        .send({ data: "invalid-data" });

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
      const res = await request(server).post(endpoint).send({
        data,
      });

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
      const res = await request(server).post(endpoint).send({
        data,
      });

      expect(res.statusCode).toBe(201);
      const {
        status,
        statusCode,
        data: { url },
      } = res.body;

      expect(status).toBe("success");
      expect(statusCode).toBe(201);
      expect(url).toBe(mockedUploadedImgURL);
    });
  });
});
