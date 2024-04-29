import request from "supertest";
import { disconnect } from "mongoose";
import "dotenv/config";
import config from "config";
import http from "http";

import appServer from "../../../src";
import { User } from "../../../src/models/user.model";

let server: http.Server;
let endpoint: string = `/${config.get("appName")}/api/v1/users`;

describe("/api/v1/users", () => {
  afterAll(async () => {
    // close the MongoDB connection
    await disconnect();
  });

  beforeEach(() => {
    server = appServer;
  });

  afterEach(async () => {
    server.close();
    // db cleanup
    await User.deleteMany({});
  });

  describe("POST /register", () => {
    it("should return BadRequest-400 if email parameter is not passed", async () => {
      // name, email and password are the required parameter to create user.
      const userData = {
        fullname: "Mickey Mouse",
        password: "clubhouse",
      };
      const res = await request(server)
        .post(`${endpoint}/register`)
        .send(userData);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"email" is required',
      });
    });

    it("should return BadRequest-400 if password is invalid", async () => {
      // valid password -> Password must be 8 to 20 characters long and contain at least 1 numeric digit, 1 lowercase letter and 1 uppercase letter.
      const userData = {
        fullname: "Mickey Mouse",
        password: "pluto",
        email: "test@test.com",
      };
      const res = await request(server)
        .post(`${endpoint}/register`)
        .send(userData);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details:
          "Password must be 8 to 20 characters long and contain at least 1 numeric digit, 1 lowercase letter and 1 uppercase letter.",
      });
    });

    it("should return BadRequest-400 if user already registered", async () => {
      await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          password: "Clubhouse12",
          email: "test@test.com",
        },
      });
      const userData = {
        fullname: "Mickey Mouse",
        password: "Clubhouse12",
        email: "test@test.com",
      };
      const res = await request(server)
        .post(`${endpoint}/register`)
        .send(userData);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "User already registered.",
      });
    });

    it("should create user if request is valid", async () => {
      const userData = {
        fullname: "Mickey Mouse",
        password: "Pluto123",
        email: "test@test.com",
      };
      const res = await request(server)
        .post(`${endpoint}/register`)
        .send(userData);
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.header["x-auth-token"]).not.toBeNull();
      const responseData = res.body.data;

      const { id, fullname, email, username, profileImage } = responseData;

      expect(id).not.toBeNull;
      expect(fullname).toBe(userData.fullname.toLowerCase());
      expect(email).toBe(userData.email);
      expect(username).toBe(userData.email.split("@")[0]);
      expect(profileImage).toMatch(/api\.dicebear\.com/);
      expect(responseData).not.toHaveProperty("password");
    });

    it("should set dynamic username if username already exists", async () => {
      // user with username = "test" already exists
      await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          password: "Clubhouse12",
          email: "test@test.com",
          username: "test",
        },
      });
      const userData = {
        fullname: "Pluto",
        password: "Pluto123",
        email: "test@test2.com",
      };
      const res = await request(server)
        .post(`${endpoint}/register`)
        .send(userData);
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");
      const responseData = res.body.data;
      expect(responseData._id).not.toBeNull;
      expect(responseData.username).not.toBe(userData.email.split("@")[0]);
      expect(responseData.username).toMatch(/test/);
    });
  });
});
