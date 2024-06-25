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
      const responseData = res.body.result;

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
        result: { id, username },
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

    it("should return all users", async () => {
      const res = await request(server).get(`${endpoint}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.results.length).toBe(2);

      const usernames = users.map((user) => user.personalInfo.username);

      res.body.results.forEach((user: IUser) => {
        expect(usernames.includes(user.personalInfo.username)).toBe(true);
      });
    });

    it("should return searched users when search query parameter is set", async () => {
      // search blog
      const searchTerm = "mickey";
      const res = await request(server).get(`${endpoint}?search=${searchTerm}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.results.length).toBe(1);
      const [user] = res.body.results;
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
      } = res.body.result;

      const [existingUser] = users.filter(
        (u) => u.personalInfo.username === username
      );
      expect(email).toBe(existingUser.personalInfo.email);
      expect(password).toBeUndefined;
      expect(googleAuth).toBeUndefined;
      expect(blogs).toBeUndefined;
    });
  });

  describe("POST /changePassword", () => {
    afterEach(async () => {
      // db cleanup
      await User.deleteMany({});
    });

    let token: string;
    const exec = async (payload: any = {}) => {
      return await request(server)
        .post(`${endpoint}/changePassword`)
        .set("authorization", token)
        .send(payload);
    };

    it("should return UnAuthorized-401 if user is not authorized", async () => {
      // token is not passed in request header
      token = "";

      const res = await exec();

      expect(res.statusCode).toBe(401);
      expect(res.text).toBe("Access Denied.Token is not provided.");
    });

    it("should return BadRequest-400 if token is invalid", async () => {
      token = "invalid token";

      const res = await exec();

      expect(res.statusCode).toBe(400);
      expect(res.text).toBe("Invalid token.");
    });

    it("should return BadRequest-400 if new password required parameter is not passed", async () => {
      // create a dummy user to get token
      const user = await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          password: "Clubhouse12",
          email: "test@test.com",
          username: "test",
        },
      });
      token = `Bearer ${user.generateAuthToken()}`;

      const res = await exec({ currentPassword: "Clubhouse12" });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"newPassword" is required',
      });
    });

    it("should return Forbidden-403 if user registered with google account tries to update password", async () => {
      // create a dummy user to get token
      const user = await User.create({
        personalInfo: {
          fullname: "Donald Duck",
          email: "donald@gmail.com",
          username: "donald",
        },
        googleAuth: true,
      });
      token = `Bearer ${user.generateAuthToken()}`;

      const res = await exec({
        currentPassword: "Clubhouse12",
        newPassword: "NewClubhouse12",
      });

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toMatchObject({
        code: "FORBIDDEN",
        message: "You do not have permission to access this resource.",
        details:
          "You can not update the account password because you logged in using Google.",
      });
    });

    it("should return BadRequest-400 if current password is incorrect", async () => {
      // create new user and get token
      const createUserRes = await request(server)
        .post(`${endpoint}/register`)
        .send({
          fullname: "Mickey Mouse",
          password: "Clubhouse12",
          email: "test@test.com",
        });
      expect(createUserRes.statusCode).toBe(201);
      expect(createUserRes.header["x-auth-token"]).not.toBeNull();
      token = `Bearer ${createUserRes.header["x-auth-token"]}`;

      //  update password request
      const res = await exec({
        currentPassword: "IncorrectPassword12",
        newPassword: "NewClubhouse12",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Incorrect current password",
      });
    });

    it("should update password successfully if valid data is passed", async () => {
      // create new user and get token
      const createUserRes = await request(server)
        .post(`${endpoint}/register`)
        .send({
          fullname: "Mickey Mouse",
          password: "Clubhouse12",
          email: "test@test.com",
        });
      expect(createUserRes.statusCode).toBe(201);
      expect(createUserRes.header["x-auth-token"]).not.toBeNull();
      token = `Bearer ${createUserRes.header["x-auth-token"]}`;

      const res = await exec({
        currentPassword: "Clubhouse12",
        newPassword: "NewClubhouse12",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.result.message).toBe("Password is changed successfully");
    });
  });

  describe("PATCH /users", () => {
    afterEach(async () => {
      // db cleanup
      await User.deleteMany({});
    });

    let token: string;
    const exec = async (payload: any = {}) => {
      return await request(server)
        .patch(`${endpoint}`)
        .set("authorization", token)
        .send(payload);
    };

    it("should return UnAuthorized-401 if user is not authorized", async () => {
      // token is not passed in request header
      token = "";

      const res = await exec();

      expect(res.statusCode).toBe(401);
      expect(res.text).toBe("Access Denied.Token is not provided.");
    });

    it("should return BadRequest-400 if social links are invalid URL", async () => {
      const user = await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          password: "Clubhouse12",
          email: "test@test.com",
          username: "test",
        },
      });
      token = `Bearer ${user.generateAuthToken()}`;

      const res = await exec({
        socialLinks: {
          youtube: "invalid url",
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"socialLinks.youtube" contains an invalid value',
      });
    });

    it("should update user profile if valid data is passed", async () => {
      const user = await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          password: "Clubhouse12",
          email: "test@test.com",
          username: "test",
        },
        socialLinks: {
          youtube: "",
          twitter: "http://twitter.com/mickey",
          github: "",
          instagram: "",
          facebook: "",
          website: "",
        },
      });
      token = `Bearer ${user.generateAuthToken()}`;

      const toUpdate = {
        fullname: "Mr. Mickey Mouse",
        bio: "I'm always ready to spread joy and inspire others to follow their dreams",
        socialLinks: {
          youtube: "http://youtube.com/channel/mickey",
          facebook: "http://facebook.com/mickey",
        },
      };

      const res = await exec(toUpdate);

      expect(res.statusCode).toBe(200);
      const {
        personalInfo: { fullname, bio },
        socialLinks: { youtube, facebook, twitter },
      } = res.body.result;

      expect(fullname).toMatch(new RegExp(toUpdate.fullname, "i"));
      expect(bio).toBe(toUpdate.bio);
      expect(youtube).toBe(toUpdate.socialLinks.youtube);
      expect(facebook).toBe(toUpdate.socialLinks.facebook);
      expect(twitter).not.toBe(""); // previous social links are not reset
    });
  });
});
