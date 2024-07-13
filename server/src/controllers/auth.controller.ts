import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

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

export { authenticateUser, authenticateWithGoogle };
