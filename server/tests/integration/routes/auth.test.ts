import request from "supertest";
import { disconnect } from "mongoose";
import "dotenv/config";
import config from "config";
import http from "http";

import appServer from "../../../src";
import { User } from "../../../src/models/user.model";

let server: http.Server;
let endpoint: string = `/${config.get("appName")}/api/v1/auth`;

describe("/api/v1/auth", () => {
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

  describe("POST /", () => {
    it("should return BadRequest-400 if email parameter is not passed", async () => {
      // email and password are the required parameter to authenticate user.
      const userData = {
        password: "clubhouse",
      };
      const res = await request(server).post(endpoint).send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"email" is required',
      });
    });

    it("should return BadRequest-400 if user does not exists", async () => {
      // user does not exists
      const userData = {
        email: "test@test.com",
        password: "clubhouse",
      };
      const res = await request(server).post(endpoint).send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Invalid email or password",
      });
    });

    it("should return BadRequest-400 if password is incorrect", async () => {
      // create user
      await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          email: "test@test.com",
          password: "Pluto123",
        },
      });

      // sending incorrect password
      const userData = {
        email: "test@test.com",
        password: "Clubhouse123",
      };
      const res = await request(server).post(endpoint).send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Invalid email or password",
      });
    });

    it("should authenticate user if request is valid", async () => {
      // call /register route so it can create user and store hash password
      const registerRes = await request(server)
        .post(`/${config.get("appName")}/api/v1/users/register`)
        .send({
          fullname: "Mickey Mouse",
          password: "Pluto123",
          email: "test@test.com",
        });
      expect(registerRes.statusCode).toBe(201);
      const { id, fullname, email, username, profileImage } =
        registerRes.body.data;
      expect(id).not.toBeNull;

      const userData = {
        email: "test@test.com",
        password: "Pluto123",
      };
      const res = await request(server).post(endpoint).send(userData);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");

      const responseData = res.body.data;
      expect(responseData.fullname).toBe(fullname.toLowerCase());
      expect(responseData.email).toBe(email);
      expect(responseData.username).toBe(username);
      expect(responseData.profileImage).toBe(profileImage);

      expect(res.headers).toHaveProperty("x-auth-token");
      expect(res.headers["x-auth-token"]).not.toBe("");
    });
  });
});
