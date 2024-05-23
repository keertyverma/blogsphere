import request from "supertest";
import { disconnect } from "mongoose";
import "dotenv/config";
import http from "http";

import appServer from "../../../src";
import { IUser, User } from "../../../src/models/user.model";

let server: http.Server;
let endpoint: string = `/api/v1/users`;

const createUser = async () => {
  const user1 = {
    personalInfo: {
      fullname: "Mickey Mouse",
      password: "Clubhouse12",
      email: "mickey@test.com",
      username: "mickey",
      profileImage: "http://example-img1.png",
    },
  };
  const user2 = {
    personalInfo: {
      fullname: "Donald Duck",
      password: "Letsgo1234",
      email: "donald@test.com",
      username: "donald",
      profileImage: "http://example-img2.png",
    },
  };

  const users = [user1, user2];
  await User.create(users);
  return users as IUser[];
};

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
  });

  describe("POST /register", () => {
    afterEach(async () => {
      // db cleanup
      await User.deleteMany({});
    });

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

      expect(id).toBeDefined();
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
      const {
        data: { id, username },
      } = res.body;

      expect(id).toBeDefined();
      expect(username).not.toBe(userData.email.split("@")[0]);
      expect(username).toMatch(/test/);
    });
  });

  describe("GET /", () => {
    let users: IUser[];

    beforeAll(async () => {
      users = await createUser();
    });

    afterAll(async () => {
      // db cleanup
      await User.deleteMany({});
    });

    it("should return all userst", async () => {
      const res = await request(server).get(`${endpoint}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);

      const usernames = users.map((user) => user.personalInfo.username);

      res.body.data.forEach((user: IUser) => {
        expect(usernames.includes(user.personalInfo.username)).toBe(true);
      });
    });

    it("should return searched users when search query parameter is set", async () => {
      // search blog
      const searchTerm = "mickey";
      const res = await request(server).get(`${endpoint}?search=${searchTerm}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      const [user] = res.body.data;
      const [existingUser] = users.filter(
        (user) => user.personalInfo.username === "mickey"
      );

      expect(user.personalInfo.fullname).toBe(
        existingUser.personalInfo.fullname.toLowerCase()
      );
      expect(user.personalInfo.username).toBe(
        existingUser.personalInfo.username
      );
    });
  });

  describe("GET /:id", () => {
    let users: IUser[];

    beforeAll(async () => {
      users = await createUser();
    });

    afterAll(async () => {
      // db cleanup
      await User.deleteMany({});
    });

    it("should return BadRequest-400 if user with given username does not exists", async () => {
      const username = "invalid-user";
      const res = await request(server).get(`${endpoint}/${username}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `User with username = ${username} does not exists!`,
      });
    });

    it("should return user with given username", async () => {
      const username = "mickey";
      const res = await request(server).get(`${endpoint}/${username}`);

      expect(res.statusCode).toBe(200);
      const {
        personalInfo: { email, password },
        googleAuth,
        blogs,
      } = res.body.data;

      const [existingUser] = users.filter(
        (u) => u.personalInfo.username === username
      );
      expect(email).toBe(existingUser.personalInfo.email);
      expect(password).toBeUndefined;
      expect(googleAuth).toBeUndefined;
      expect(blogs).toBeUndefined;
    });
  });
});
