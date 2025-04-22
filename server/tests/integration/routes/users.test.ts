import cookie from "cookie";
import "dotenv/config";
import { Server } from "http";
import { disconnect } from "mongoose";
import request from "supertest";
import bcrypt from "bcrypt";
import { Application } from "express";

import { startServer } from "../../../src/start";
import { IUser, IUserDocument, User } from "../../../src/models/user.model";

let server: Server;
let app: Application; // Express instance
let endpoint: string = `/api/v1/users`;

const createUsers = async () => {
  const user1 = await User.create({
    personalInfo: {
      fullname: "Mickey Mouse",
      password: "Clubhouse12",
      email: "mickey@test.com",
      username: "mickey",
      profileImage: "http://example-img1.png",
    },
    isVerified: true,
    usernameChanged: false,
  });

  const user2 = await User.create({
    personalInfo: {
      fullname: "Donald Duck",
      password: "Letsgo1234",
      email: "donald@test.com",
      username: "donald",
      profileImage: "http://example-img2.png",
    },
    isVerified: true,
    usernameChanged: true,
  });

  const user3 = await User.create({
    personalInfo: {
      fullname: "Pete",
      password: "Villain1234",
      email: "pete@test.com",
      username: "pete_villain",
      profileImage: "http://example-img-pete.png",
    },
    isVerified: false,
    usernameChanged: false,
  });

  const users: IUserDocument[] = [user1, user2, user3];
  return users;
};

describe("/api/v1/users", () => {
  beforeAll(async () => {
    try {
      ({ server, app } = await startServer());
    } catch (error) {
      console.error(
        "🚨 Test server startup failed!\n",
        error instanceof Error ? error.message : String(error)
      );
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  });

  afterAll(async () => {
    if (!server) return;
    server.close();
    await disconnect();
  });

  describe("POST /register", () => {
    afterEach(async () => {
      if (!server) return;
      // db cleanup
      await User.deleteMany({});
    });

    it("should return BadRequest-400 if email parameter is not passed", async () => {
      // name, email and password are the required parameter to create user.
      const userData = {
        fullname: "Mickey Mouse",
        password: "clubhouse",
      };
      const res = await request(app)
        .post(`${endpoint}/register`)
        .send(userData);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Email is required.",
      });
    });

    it("should return BadRequest-400 if password is invalid", async () => {
      // valid password -> Password must be 8 to 20 characters long and contain at least 1 numeric digit, 1 lowercase letter and 1 uppercase letter.
      const userData = {
        fullname: "Mickey Mouse",
        password: "plutonic",
        email: "test@test.com",
      };
      const res = await request(app)
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

    it("should return BadRequest-400 if an account with the given email already exists.", async () => {
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
      const res = await request(app)
        .post(`${endpoint}/register`)
        .send(userData);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "An account with this email already exists.",
      });
    });

    it("should create user if request is valid", async () => {
      const userData = {
        fullname: "Mickey Mouse",
        password: "Pluto123",
        email: "test@test.com",
      };
      const res = await request(app)
        .post(`${endpoint}/register`)
        .send(userData);
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.message).toBe(
        "Registration successfull!.Please check your email to verify your account."
      );

      const responseData = res.body.result;
      const { id, fullname, email, username, profileImage } = responseData;
      expect(id).toBeDefined();
      expect(fullname).toBe(userData.fullname);
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

      const res = await request(app)
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
    let users: IUserDocument[];

    beforeAll(async () => {
      if (!server) return;
      users = await createUsers();
    });

    afterAll(async () => {
      if (!server) return;
      // db cleanup
      await User.deleteMany({});
    });

    it("should return all verified users", async () => {
      const verifiedUsernames = users
        .filter((user) => user.isVerified)
        .map((user) => user.personalInfo.username);

      const res = await request(app).get(endpoint);

      expect(res.statusCode).toBe(200);
      expect(res.body.results).toHaveLength(verifiedUsernames.length);
      const responseUsernames = res.body.results.map(
        (user: IUser) => user.personalInfo.username
      );

      expect(new Set(responseUsernames)).toEqual(new Set(verifiedUsernames));
    });

    it("should return searched users when search query parameter is set", async () => {
      // search blog
      const searchTerm = "mickey";

      const res = await request(app).get(`${endpoint}?search=${searchTerm}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.results.length).toBe(1);
      const [user] = res.body.results;
      const [existingUser] = users.filter(
        (user) => user.personalInfo.username === "mickey"
      );
      expect(user.personalInfo.fullname).toBe(
        existingUser.personalInfo.fullname
      );
      expect(user.personalInfo.username).toBe(
        existingUser.personalInfo.username
      );
    });
  });

  describe("GET /:id", () => {
    let users: IUserDocument[];

    beforeAll(async () => {
      if (!server) return;
      users = await createUsers();
    });

    afterAll(async () => {
      if (!server) return;
      // db cleanup
      await User.deleteMany({});
    });

    it("should return 404 Not Found if user with given username does not exists", async () => {
      const username = "invalid-user";
      const res = await request(app).get(`${endpoint}/${username}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `User with username = ${username} does not exist!`,
      });
    });

    it("should return 404 Not Found if user is not verified", async () => {
      const username = "pete_villain"; // User registered but not verified

      const res = await request(app).get(`${endpoint}/${username}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toEqual({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `User with username = ${username} does not exist!`,
      });
    });

    it("should return user with given username", async () => {
      const username = "mickey";
      const res = await request(app).get(`${endpoint}/${username}`);

      expect(res.statusCode).toBe(200);
      const {
        personalInfo: { email, password },
        googleAuth,
        blogs,
      } = res.body.result;

      const [existingUser] = users.filter(
        (u) => u.personalInfo.username === username
      );
      expect(password).toBeUndefined;
      expect(googleAuth).toBeUndefined;
      expect(blogs).toBeUndefined;
    });
  });

  describe("POST /changePassword", () => {
    afterEach(async () => {
      if (!server) return;
      // db cleanup
      await User.deleteMany({});
    });

    let token: string;
    const exec = async (payload: any = {}) => {
      return await request(app)
        .post(`${endpoint}/changePassword`)
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

      const res = await exec();

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Invalid auth token.",
      });
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
      token = user.generateAuthToken();

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
      token = user.generateAuthToken();

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
      // login user and get token
      const password = "Clubhouse12";
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          email: "test@test.com",
          password: hashedPassword,
        },
        isVerified: true,
      });
      const loginRes = await request(app).post(`/api/v1/auth`).send({
        email: user.personalInfo.email,
        password: password,
      });
      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.headers["set-cookie"]).toBeDefined();
      // Parse the set-cookie header to get authToken
      const cookies = cookie.parse(loginRes.headers["set-cookie"][0]);
      expect(cookies.authToken).toBeDefined();
      token = cookies.authToken;

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
      // login user and get token
      const password = "Clubhouse12";
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          email: "test@test.com",
          password: hashedPassword,
        },
        isVerified: true,
      });
      const loginRes = await request(app).post(`/api/v1/auth`).send({
        email: user.personalInfo.email,
        password: password,
      });
      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.headers["set-cookie"]).toBeDefined();
      // Parse the set-cookie header to get authToken
      const cookies = cookie.parse(loginRes.headers["set-cookie"][0]);
      expect(cookies.authToken).toBeDefined();
      token = cookies.authToken;

      const res = await exec({
        currentPassword: password,
        newPassword: "NewClubhouse12",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.result.message).toBe("Password is changed successfully");
    });
  });

  describe("PATCH /users", () => {
    afterEach(async () => {
      if (!server) return;
      // db cleanup
      await User.deleteMany({});
    });

    let token: string;
    const exec = async (payload: any = {}) => {
      return await request(app)
        .patch(`${endpoint}`)
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

    it("should return BadRequest-400 if social links are invalid URL", async () => {
      const user = await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          password: "Clubhouse12",
          email: "test@test.com",
          username: "test",
        },
      });
      token = user.generateAuthToken();

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
      token = user.generateAuthToken();

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

  describe("PATCH /changeUsername", () => {
    let users: IUserDocument[];

    beforeAll(async () => {
      if (!server) return;
      await User.deleteMany({}); // clean first
      users = await createUsers();
    });

    afterAll(async () => {
      if (!server) return;
      // db cleanup
      await User.deleteMany({});
    });

    let token: string;
    const exec = async (payload: any = {}) => {
      return await request(app)
        .patch(`${endpoint}/changeUsername`)
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

    it("should return Forbidden-403 if user has already changed username", async () => {
      // Find a user who has already changed their username (username change allowed only once)
      const [user, _] = users.filter((user) => user.usernameChanged === true);
      token = user.generateAuthToken();

      const res = await exec({ newUsername: "newname" });

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toMatchObject({
        code: "FORBIDDEN",
        message: "You do not have permission to access this resource.",
        details:
          "You’ve already changed your username. This action is allowed only once.",
      });
    });

    it("should return BadRequest-400 if username format is invalid", async () => {
      // Find a user who have not changed their username (username change allowed only once)
      const [user, _] = users.filter((user) => user.usernameChanged === false);
      token = user.generateAuthToken();

      // Username must be 1–30 characters long and can include letters, numbers, hyphens (-), and underscores (_); no spaces or special characters allowed
      const res = await exec({ newUsername: "invalid;@,." });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details:
          "Username can only contain letters, numbers, hyphens(-), and underscores(_).",
      });
    });

    it("should return BadRequest-400 if username is already taken", async () => {
      const [user1, user2] = users.filter(
        (user) => user.usernameChanged === false
      );
      token = user1.generateAuthToken();

      const res = await exec({ newUsername: user2.personalInfo.username });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "This username is already taken.",
      });
    });

    it("should return BadRequest-400 if username is reserved", async () => {
      // Find a user who have not changed their username (username change allowed only once)
      const [user, _] = users.filter((user) => user.usernameChanged === false);
      token = user.generateAuthToken();

      const res = await exec({ newUsername: "admin" });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "This username is reserved and cannot be used.",
      });
    });

    it("should update username successfully with valid data", async () => {
      // Find a user who have not changed their username (username change allowed only once)
      const [user, _] = users.filter((user) => user.usernameChanged === false);
      token = user.generateAuthToken();
      const newUsername = "Newusername-1";

      const res = await exec({ newUsername });

      expect(res.statusCode).toBe(200);
      expect(res.body.result.message).toBe("Username updated successfully.");
      expect(res.body.result.username).toBe(newUsername.toLowerCase());
    });
  });
});
