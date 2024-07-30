import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

import crypto from "crypto";
import { User } from "../models/user.model";
import { APIResponse, APIStatus } from "../types/api-response";
import { generateUsername, getCookieOptions } from "../utils";
import BadRequestError from "../utils/errors/bad-request";
import CustomAPIError from "../utils/errors/custom-api";
import FirebaseAuthError from "../utils/errors/firebase-error";
import { verifyIdToken } from "../utils/firebase-auth";
import logger from "../utils/logger";

const validate = (req: { email: string; password: string }) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(8).max(1024).required(),
  });

  return schema.validate(req);
};

const authenticateUser = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}`);
  // validate request body
  const { error } = validate(req.body);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  // check if user exists
  const { email, password } = req.body;
  const user = await User.findOne({ "personalInfo.email": email });
  if (!user) {
    throw new BadRequestError("Invalid email or password");
  }

  // if googleAuth is set then ask user to login with google option
  if (user.googleAuth) {
    throw new CustomAPIError(
      "Account was created using Google. Please log in using Google.",
      StatusCodes.FORBIDDEN
    );
  }

  // verify password
  const isValidPassword = await bcrypt.compare(
    password,
    user.personalInfo.password || ""
  );
  if (!isValidPassword) {
    throw new BadRequestError("Invalid email or password");
  }

  const accessToken = user.generateAuthToken();
  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    result: {
      id: user.id,
      fullname: user.personalInfo?.fullname,
      email: user.personalInfo?.email,
      username: user.personalInfo?.username,
      profileImage: user.personalInfo.profileImage,
    },
  };

  // send token inside cookies (`HTTP-only` secure)
  return res
    .cookie("authToken", accessToken, getCookieOptions())
    .status(data.statusCode)
    .json(data);
};

const validateGoogleAuth = (req: { accessToken: string }) => {
  const schema = Joi.object({
    accessToken: Joi.string().required(),
  });

  return schema.validate(req);
};

const authenticateWithGoogle = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}`);
  // validate request body
  const { error } = validateGoogleAuth(req.body);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  try {
    // verify access token
    const { accessToken } = req.body;
    const decodedUser = await verifyIdToken(accessToken);
    let { email, name, picture } = decodedUser;

    // get high resolution user picture
    picture = picture?.replace("s96-c", "s384-c");

    // get user by email
    let user = await User.findOne({ "personalInfo.email": email });
    if (user) {
      if (!user.googleAuth) {
        // do not allow user to continue with google authentication
        throw new CustomAPIError(
          "This email address was registered without using Google sign-in. Please use your password to log in and access the account",
          StatusCodes.FORBIDDEN
        );
      }
    } else {
      // create user
      const username = await generateUsername(email || "");
      user = new User({
        personalInfo: {
          fullname: name,
          email,
          username,
          profileImage: picture,
        },
        googleAuth: true,
      });
      await user.save();
    }

    const userAccessToken = user.generateAuthToken();
    const data: APIResponse = {
      status: APIStatus.SUCCESS,
      statusCode: StatusCodes.OK,
      result: {
        id: user.id,
        fullname: user.personalInfo?.fullname,
        email: user.personalInfo?.email,
        username: user.personalInfo?.username,
        profileImage: user.personalInfo.profileImage,
      },
    };

    // send token inside cookies (`HTTP-only` secure)
    return res
      .cookie("authToken", userAccessToken, getCookieOptions())
      .status(data.statusCode)
      .json(data);
  } catch (error) {
    const err = error as FirebaseAuthError;
    if (err.code === "auth/argument-error") {
      throw new BadRequestError("Invalid Access Token");
    } else if (err.code === "auth/id-token-expired") {
      throw new BadRequestError("Access Token has expired");
    } else {
      throw error;
    }
  }
};

const logout = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}/logout`);

  // clear token cookie
  res.clearCookie("authToken", getCookieOptions());
  res.status(200).json({ message: "Logout successful" });
};

const _validateVerifyUserAccount = (data: { email: string; token: string }) => {
  const schema = Joi.object({
    email: Joi.string().trim().required(),
    token: Joi.string().trim().required(),
  });

  const { error, value: validatedData } = schema.validate(data);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  return validatedData;
};

const verifyEmail = async (req: Request, res: Response) => {
  logger.debug(`GET Request on Route -> ${req.baseUrl}/verify-email`);

  // validate request query parameter
  const { email, token } = _validateVerifyUserAccount(
    req.query as { email: string; token: string }
  );

  // hash token and find the user
  const hashToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    "personalInfo.email": email,
    "verificationToken.token": hashToken,
  });
  if (!user) {
    throw new BadRequestError("Invalid Verification link");
  }

  // check for token expiration
  if (user.verificationToken && user.verificationToken.expiresAt < new Date()) {
    throw new BadRequestError(
      "Verification link expired. Please request a new one"
    );
  }

  // update user status to verified
  user.isVerified = true;
  // clear the verification token and expiry
  user.verificationToken = undefined;
  await user.save();

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    message: "Email verified successfully.",
  };

  return res.status(data.statusCode).json(data);
};

export { authenticateUser, authenticateWithGoogle, logout, verifyEmail };
