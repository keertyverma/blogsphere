import cookie from "cookie";
import "dotenv/config";
import http from "http";
import { disconnect } from "mongoose";
import request from "supertest";

import appServer from "../../../src";
import { User } from "../../../src/models/user.model";
import FirebaseAuthError from "../../../src/utils/errors/firebase-error";
import * as firebaseAuth from "../../../src/utils/firebase-auth";

let server: http.Server;
let endpoint: string = `/api/v1/auth`;

type DecodedIdToken = {
  email: string;
  name: string;
  picture: string;
  aud: string;
  auth_time: number;
  exp: number;
  firebase: {
    identities: {
      [key: string]: any[];
    };
    sign_in_provider: string;
  };
  iat: number;
  iss: string;
  sub: string;
  uid: string;
};

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

    it("should return Forbidden-403 if user is registered with google account", async () => {
      // create user
      await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          email: "test@gmail.com",
          password: "Pluto123",
        },
        googleAuth: true,
      });

      // sending incorrect password
      const userData = {
        email: "test@gmail.com",
        password: "Clubhouse123",
      };
      const res = await request(server).post(endpoint).send(userData);

      expect(res.statusCode).toBe(403);

      expect(res.body.error).toMatchObject({
        code: "FORBIDDEN",
        message: "You do not have permission to access this resource.",
        details:
          "Account was created using Google. Please log in using Google.",
      });
    });

    it("should authenticate user if request is valid", async () => {
      // call /register route so it can create user and store hash password
      const registerRes = await request(server)
        .post(`/api/v1/users/register`)
        .send({
          fullname: "Mickey Mouse",
          password: "Pluto123",
          email: "test@test.com",
        });
      expect(registerRes.statusCode).toBe(201);
      const { id, fullname, email, username, profileImage } =
        registerRes.body.result;
      expect(id).not.toBeNull;

      const userData = {
        email: "test@test.com",
        password: "Pluto123",
      };
      const res = await request(server).post(endpoint).send(userData);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");

      const responseData = res.body.result;
      expect(responseData.fullname).toBe(fullname.toLowerCase());
      expect(responseData.email).toBe(email);
      expect(responseData.username).toBe(username);
      expect(responseData.profileImage).toBe(profileImage);

      // Ensure the authToken is set in the cookie
      expect(res.headers["set-cookie"]).toBeDefined();
      // Parse the set-cookie header to get authToken
      const cookies = cookie.parse(res.headers["set-cookie"][0]);
      expect(cookies.authToken).toBeDefined();
    });
  });

  describe("POST /google-auth", () => {
    const exec = async (accessToken: string) => {
      return await request(server).post(`${endpoint}/google-auth`).send({
        accessToken,
      });
    };

    const mockUser = {
      email: "test@test.com",
      name: "User-1",
      picture: "http://example.com/dummy=s96-c",
    } as DecodedIdToken;

    it("should return BadRequest-400 if access token is not provided", async () => {
      const userData = {
        token: "",
      };
      const res = await request(server)
        .post(`${endpoint}/google-auth`)
        .send(userData);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"accessToken" is required',
      });
    });

    it("should return BadRequest-400 if access token is invalid", async () => {
      // Mock verifyIdToken function to return rejected promise with error
      jest
        .spyOn(firebaseAuth, "verifyIdToken")
        .mockRejectedValue(
          new FirebaseAuthError(
            "Firebase ID token has invalid signature.",
            "auth/argument-error"
          )
        );

      const accessToken = "invalid token";
      const res = await exec(accessToken);

      expect(firebaseAuth.verifyIdToken).toHaveBeenCalledWith(accessToken);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Invalid Access Token",
      });
    });

    it("should return BadRequest-400 if access token is expired", async () => {
      // Mock verifyIdToken function to return rejected promise with error
      jest
        .spyOn(firebaseAuth, "verifyIdToken")
        .mockRejectedValue(
          new FirebaseAuthError(
            "Firebase ID token has expired.",
            "auth/id-token-expired"
          )
        );

      const accessToken = "expired token";
      const res = await exec(accessToken);

      expect(firebaseAuth.verifyIdToken).toHaveBeenCalledWith(accessToken);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Access Token has expired",
      });
    });

    it("should return Forbidden-403 if user is already registered with same email without google sign-in", async () => {
      // Mock verifyIdToken function to return a mock user object
      jest.spyOn(firebaseAuth, "verifyIdToken").mockResolvedValue(mockUser);

      // create user with same email
      await User.create({
        personalInfo: {
          fullname: mockUser.name,
          email: mockUser.email,
        },
      });

      const accessToken = "valid token";
      const res = await exec(accessToken);

      expect(firebaseAuth.verifyIdToken).toHaveBeenCalledWith(accessToken);
      expect(res.statusCode).toBe(403);
      expect(res.body.error).toMatchObject({
        code: "FORBIDDEN",
        message: "You do not have permission to access this resource.",
        details:
          "This email address was registered without using Google sign-in. Please use your password to log in and access the account",
      });
    });

    it("should authenticate user if google auth is set for given user", async () => {
      // Mock verifyIdToken function to return a mock user object
      jest.spyOn(firebaseAuth, "verifyIdToken").mockResolvedValue(mockUser);

      // create user with same email and set googleAuth
      const user = await User.create({
        personalInfo: {
          fullname: mockUser.name,
          email: mockUser.email,
        },
        googleAuth: true,
      });

      const accessToken = "valid token";
      const res = await exec(accessToken);
      expect(res.statusCode).toBe(200);

      expect(firebaseAuth.verifyIdToken).toHaveBeenCalledWith(accessToken);

      // Ensure the authToken' is set in the cookie
      expect(res.headers["set-cookie"]).toBeDefined();
      // Parse the set-cookie header to get authToken
      const cookies = cookie.parse(res.headers["set-cookie"][0]);
      expect(cookies.authToken).toBeDefined();

      // User data in response body
      const { fullname, email, username } = res.body.result;
      expect(fullname).toBe(user.personalInfo.fullname);
      expect(email).toBe(user.personalInfo.email);
      expect(username).toBe(user.personalInfo.username);
    });

    it("should create user and authenticate if user does not exists", async () => {
      // Mock verifyIdToken function to return a mock user object
      jest.spyOn(firebaseAuth, "verifyIdToken").mockResolvedValue(mockUser);

      const accessToken = "valid token";
      const res = await exec(accessToken);
      expect(res.statusCode).toBe(200);

      expect(firebaseAuth.verifyIdToken).toHaveBeenCalledWith(accessToken);

      // check if user is created in DB and googleAuth is set
      const user = await User.findOne({ "personalInfo.email": mockUser.email });
      expect(user?.googleAuth).toBeTruthy();

      // Ensure the lauthToken' is set in the cookie
      expect(res.headers["set-cookie"]).toBeDefined();
      // Parse the set-cookie header to get authToken
      const cookies = cookie.parse(res.headers["set-cookie"][0]);
      expect(cookies.authToken).toBeDefined();

      // User data in response body
      const { fullname, email, username } = res.body.result;
      expect(fullname).toBe(user?.personalInfo.fullname);
      expect(email).toBe(user?.personalInfo.email);
      expect(username).toBe(user?.personalInfo.username);
    });
  });

  describe("POST /logout", () => {
    let token: string;

    const exec = async () => {
      return await request(server)
        .post(`${endpoint}/logout`)
        .set("Cookie", `authToken=${token}`);
    };

    it("should return 401 if user is not authenticated", async () => {
      token = "";
      const res = await exec();

      expect(res.statusCode).toBe(401);
      expect(res.text).toBe("Access Denied.Token is not provided.");
    });

    it("should clear the authToken cookie on logout", async () => {
      // create a valid user
      const user = await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          email: "test@test.com",
          password: "Pluto123",
        },
      });
      token = user.generateAuthToken();

      const res = await exec();

      expect(res.statusCode).toBe(200);
      // authToken must be empty within cookie token
      const cookies = cookie.parse(res.headers["set-cookie"][0]);
      expect(cookies.authToken).toBe("");
    });
  });
});
