import bcrypt from "bcrypt";
import cookie from "cookie";
import "dotenv/config";
import { Server } from "http";
import { Application } from "express";
import { disconnect } from "mongoose";
import ms from "ms";
import request from "supertest";

import { IUser, User } from "../../../src/models/user.model";
import FirebaseAuthError from "../../../src/utils/errors/firebase-error";
import * as firebaseAuth from "../../../src/utils/firebase-auth";
import { startServer } from "../../../src/start";

let server: Server;
let app: Application;
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
  beforeAll(async () => {
    try {
      ({ server, app } = await startServer());
    } catch (error) {
      console.error("🚨 Server startup failed in tests:", error);
      throw new Error("Failed to start the test server");
    }
  });

  afterAll(async () => {
    if (!server) return;
    server.close();
    await disconnect();
  });

  afterEach(async () => {
    if (!server) return;
    await User.deleteMany({});
  });

  describe("POST /", () => {
    it("should return BadRequest-400 if email parameter is not passed", async () => {
      // email and password are the required parameter to authenticate user.
      const userData = {
        password: "clubhouse",
      };
      const res = await request(app).post(endpoint).send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Email is required.",
      });
    });

    it("should return BadRequest-400 if user does not exists", async () => {
      // user does not exists
      const userData = {
        email: "test@test.com",
        password: "clubhouse",
      };
      const res = await request(app).post(endpoint).send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Invalid email or password",
      });
    });

    it("should return BadRequest-400 if user is not verified", async () => {
      // create user
      await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          email: "test@test.com",
          password: "Pluto123",
        },
      });

      const userData = {
        email: "test@test.com",
        password: "Pluto123",
      };
      const res = await request(app).post(endpoint).send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Account is not verified.",
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
        isVerified: true,
      });

      // sending incorrect password
      const userData = {
        email: "test@test.com",
        password: "Clubhouse123",
      };
      const res = await request(app).post(endpoint).send(userData);

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
        isVerified: true,
        googleAuth: true,
      });

      // sending incorrect password
      const userData = {
        email: "test@gmail.com",
        password: "Clubhouse123",
      };
      const res = await request(app).post(endpoint).send(userData);

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
      const registerRes = await request(app)
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
      // verify user
      const user = await User.findById(id);
      if (user) {
        user.isVerified = true;
        await user.save();
      }

      const userData = {
        email: "test@test.com",
        password: "Pluto123",
      };
      const res = await request(app).post(endpoint).send(userData);

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
      return await request(app).post(`${endpoint}/google-auth`).send({
        accessToken,
      });
    };

    const mockUser = {
      email: "test@gmail.com",
      name: "User-1",
      picture: "http://example.com/dummy=s96-c",
    } as DecodedIdToken;

    it("should return BadRequest-400 if access token is not provided", async () => {
      const userData = {
        token: "",
      };
      const res = await request(app)
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
      const user = (await User.findOne({
        "personalInfo.email": mockUser.email,
      })) as IUser;
      expect(user.googleAuth).toBeTruthy();
      expect(user.isVerified).toBeTruthy();

      // Ensure the 'authToken' is set in the cookie
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
      return await request(app)
        .post(`${endpoint}/logout`)
        .set("Cookie", `authToken=${token}`);
    };

    it("should return 401 if user is not authenticated", async () => {
      token = "";
      const res = await exec();

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toMatchObject({
        code: "UNAUTHORIZED",
        message: "Unauthorized access.",
        details: "Access Denied.Token is not provided.",
      });
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

  describe("POST /verify-email", () => {
    afterEach(async () => {
      if (!server) return;
      // db cleanup
      await User.deleteMany({});
    });

    it("should return BadRequest-400 if token is not passed", async () => {
      // email and token are the required parameter for token verification.
      const email = "test@test.com";
      const res = await request(app).post(`${endpoint}/verify-email`).send({
        email,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"token" is required',
      });
    });

    it("should return BadRequest-400 if token is not valid", async () => {
      // token is invalid
      const email = "test@test.com";
      const token = "invalid-token";
      const res = await request(app).post(`${endpoint}/verify-email`).send({
        email,
        token,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Invalid Verification link",
      });
    });

    it("should return BadRequest-400 if token has expired", async () => {
      // create user
      const user = await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          email: "test@test.com",
          password: "Pluto123",
        },
      });

      // set token expiration to previous day
      const { token, hashedToken } = user.generateVerificationToken();
      user.verificationToken = {
        token: hashedToken,
        expiresAt: new Date(Date.now() - ms("1d")),
      };
      await user.save();

      const email = user.personalInfo.email;
      const res = await request(app).post(`${endpoint}/verify-email`).send({
        email,
        token,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Verification link expired. Please request a new one",
      });
    });

    it("should notify user if account is already verified", async () => {
      // create user and set verification status
      const user = await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          email: "test@test.com",
          password: "Pluto123",
        },
        isVerified: true,
      });

      const token = "some-random-token";
      const email = user.personalInfo.email;
      const res = await request(app).post(`${endpoint}/verify-email`).send({
        email,
        token,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Email is already verified.");
    });

    it("should verify user account successfully", async () => {
      // create user and set verification token and expiration
      const user = await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          email: "test@test.com",
          password: "Pluto123",
        },
      });
      const { token, hashedToken, expiresAt } =
        user.generateVerificationToken();
      user.verificationToken = {
        token: hashedToken,
        expiresAt,
      };
      await user.save();
      expect(user.isVerified).toBeFalsy();

      const email = user.personalInfo.email;
      const res = await request(app).post(`${endpoint}/verify-email`).send({
        email,
        token,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Email verified successfully.");

      const updatedUser = (await User.findById(user.id).select(
        "isVerified verificationToken"
      )) as IUser;
      // user account is verified
      const { isVerified, verificationToken } = updatedUser;
      expect(isVerified).toBeTruthy();
      // verification token is removed
      expect(verificationToken?.token).not.toBeDefined();
      expect(verificationToken?.expiresAt).not.toBeDefined();
    });
  });

  describe("POST /resend-verification", () => {
    afterEach(async () => {
      if (!server) return;
      // db cleanup
      await User.deleteMany({});
    });

    it("should avoid explicitly indicating if the email is unregistered", async () => {
      const email = "randomuser@test.com";
      const res = await request(app)
        .post(`${endpoint}/resend-verification`)
        .send({ email });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(
        /If the email is associated with an account, a verfication email will be sent/i
      );
    });

    it("should return BadRequest-400 if user is already verified", async () => {
      // create user
      const user = await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          email: "test@test.com",
          password: "Pluto123",
        },
        isVerified: true,
      });

      const res = await request(app)
        .post(`${endpoint}/resend-verification`)
        .send({
          email: user.personalInfo.email,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Account already verified.",
      });
    });

    it("should return BadRequest-400 if token has not expired yet", async () => {
      // create user
      const user = await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          email: "test@test.com",
          password: "Pluto123",
        },
        isVerified: false,
      });
      // set token expiration to next day
      const { hashedToken } = user.generateVerificationToken();
      user.verificationToken = {
        token: hashedToken,
        expiresAt: new Date(Date.now() + ms("1d")),
      };
      await user.save();

      const res = await request(app)
        .post(`${endpoint}/resend-verification`)
        .send({
          email: user.personalInfo.email,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "An active verification token already exists.",
      });
    });

    it("should resend verification email", async () => {
      // if user is not verified and token has expired then resend verification email
      const user = await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          email: "test@test.com",
          password: "Pluto123",
        },
        isVerified: false,
      });
      // set token expiration to previous day
      const { hashedToken } = user.generateVerificationToken();
      user.verificationToken = {
        token: hashedToken,
        expiresAt: new Date(Date.now() - ms("1d")),
      };
      await user.save();

      const res = await request(app)
        .post(`${endpoint}/resend-verification`)
        .send({
          email: user.personalInfo.email,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(
        /If the email is associated with an account, a verfication email will be sent/i
      );
    });
  });

  describe("POST /forgot-password", () => {
    afterEach(async () => {
      if (!server) return;
      // db cleanup
      await User.deleteMany({});
    });

    it("should avoid explicitly indicating if the email is unregistered", async () => {
      const email = "randomuser@test.com";
      const res = await request(app)
        .post(`${endpoint}/forgot-password`)
        .send({ email });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(
        /If the email is associated with an account, a password reset email will be sent/i
      );
    });

    it("should return BadRequest-400 if password reset token has not expired yet", async () => {
      // if token has not expired that means existing token can be use to verify and reset password
      const user = await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          email: "test@test.com",
          password: "Pluto123",
        },
        isVerified: true,
      });
      // set token expiration to next day
      const { hashedToken } = user.generateResetPasswordToken();
      user.resetPasswordToken = {
        token: hashedToken,
        expiresAt: new Date(Date.now() + ms("1d")),
      };
      await user.save();

      const res = await request(app).post(`${endpoint}/forgot-password`).send({
        email: user.personalInfo.email,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "An active password reset token already exists.",
      });
    });

    it("should send password reset email", async () => {
      // if token has expired or not exists then send password reset email
      const user = await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          email: "test@test.com",
          password: "Pluto123",
        },
        isVerified: true,
      });
      // set token expiration to previous day
      const { hashedToken } = user.generateResetPasswordToken();
      user.resetPasswordToken = {
        token: hashedToken,
        expiresAt: new Date(Date.now() - ms("1d")),
      };
      await user.save();

      const res = await request(app).post(`${endpoint}/forgot-password`).send({
        email: user.personalInfo.email,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(
        /If the email is associated with an account, a password reset email will be sent/i
      );
    });
  });

  describe("POST /reset-password", () => {
    afterEach(async () => {
      if (!server) return;
      // db cleanup
      await User.deleteMany({});
    });

    it("should return BadRequest-400 if token is not passed", async () => {
      // token is the required parameter for token verification.
      const email = "test@test.com";
      const res = await request(app).post(`${endpoint}/reset-password`).send({
        email,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"token" is required',
      });
    });

    it("should return BadRequest-400 if password is invalid", async () => {
      // valid password -> Password must be 8 to 20 characters long and contain at least 1 numeric digit, 1 lowercase letter and 1 uppercase letter.
      const email = "test@test.com";
      const token = "random-token";
      const newPassword = "invalid-password";
      const res = await request(app).post(`${endpoint}/reset-password`).send({
        email,
        token,
        password: newPassword,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details:
          "Password must be 8 to 20 characters long and contain at least 1 numeric digit, 1 lowercase letter and 1 uppercase letter.",
      });
    });

    it("should return BadRequest-400 if token is not valid", async () => {
      // token is invalid
      const email = "test@test.com";
      const token = "invalid-token";
      const newPassword = "Clubhouse123";
      const res = await request(app).post(`${endpoint}/reset-password`).send({
        email,
        token,
        password: newPassword,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Invalid Password Reset link",
      });
    });

    it("should return BadRequest-400 if token has expired", async () => {
      // create user
      const user = await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          email: "test@test.com",
          password: "Clubhouse123",
        },
      });

      // set token expiration to previous day
      const { token, hashedToken } = user.generateResetPasswordToken();
      user.resetPasswordToken = {
        token: hashedToken,
        expiresAt: new Date(Date.now() - ms("1d")),
      };
      await user.save();

      const newPassword = "Pluto123";
      const res = await request(app).post(`${endpoint}/reset-password`).send({
        email: user.personalInfo.email,
        token,
        password: newPassword,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Password Reset link expired. Please request a new one",
      });
    });

    it("should reset user password", async () => {
      // create user
      const user = await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          email: "test@test.com",
          password: "Clubhouse123",
        },
      });
      // set token expiration to next day
      const { token, hashedToken } = user.generateResetPasswordToken();
      user.resetPasswordToken = {
        token: hashedToken,
        expiresAt: new Date(Date.now() + ms("1d")),
      };
      await user.save();
      const newPassword = "Pluto123";

      const res = await request(app).post(`${endpoint}/reset-password`).send({
        email: user.personalInfo.email,
        token,
        password: newPassword,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Password reset completed successfully.");
      const updatedUser = (await User.findById(user.id)) as IUser;
      const {
        personalInfo: { password: userPassword },
        resetPasswordToken,
      } = updatedUser;

      // check for user password
      const isValidPassword = await bcrypt.compare(
        newPassword,
        userPassword || ""
      );
      expect(isValidPassword).toBeTruthy();
      // reset password token is removed
      expect(resetPasswordToken?.token).not.toBeDefined();
      expect(resetPasswordToken?.expiresAt).not.toBeDefined();
    });
  });
});
