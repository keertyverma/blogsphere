import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

import { User, validateUser } from "../models/user.model";
import { APIResponse, APIStatus } from "../types/api-response";
import { generateUsername } from "../utils";
import BadRequestError from "../utils/errors/bad-request";
import CustomAPIError from "../utils/errors/custom-api";
import NotFoundError from "../utils/errors/not-found";
import logger from "../utils/logger";
import {
  validatePasswordUpdate,
  validateUserUpdate,
} from "../utils/validations";

export const createUser = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}`);

  // validate request body
  const { error } = validateUser(req.body);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  const { fullname, email, password } = req.body;
  // check if user exists
  const existingUser = await User.findOne({ "personalInfo.email": email });
  if (existingUser) {
    throw new BadRequestError(`User already registered.`);
  }

  // secure password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create user
  const username = await generateUsername(email);

  const user = new User({
    personalInfo: {
      fullname,
      email,
      password: hashedPassword,
      username,
    },
  });
  await user.save();
  const accessToken = user.generateAuthToken();

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.CREATED,
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
    .cookie("authToken", accessToken, {
      httpOnly: true, // Prevents JavaScript from accessing the cookie. Helps mitigate XSS attacks
      secure: process.env.NODE_ENV === "production", // Ensures cookie is sent only over HTTPS in production
    })
    .status(data.statusCode)
    .json(data);
};

export const getUsers = async (req: Request, res: Response) => {
  logger.debug(`GET Request on Route -> ${req.baseUrl}`);

  const { search, limit } = req.query;

  const max_limit = limit ? parseInt(limit as string) : 10;

  const findQuery = {
    ...(search && {
      $or: [
        { "personalInfo.username": new RegExp(`${search}`, "i") },
        { "personalInfo.fullname": new RegExp(`${search}`, "i") },
      ],
    }),
  };

  const users = await User.find(findQuery)
    .limit(max_limit)
    .select(
      "personalInfo.fullname personalInfo.username personalInfo.profileImage personalInfo.bio -_id"
    );

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    results: users,
  };

  return res.status(data.statusCode).json(data);
};

export const getUserById = async (req: Request, res: Response) => {
  logger.debug(`GET By Id Request on Route -> ${req.baseUrl}`);

  const { id: username } = req.params;

  const user = await User.findOne({ "personalInfo.username": username }).select(
    "-personalInfo.password -googleAuth -blogs -updatedAt -__v"
  );
  if (!user)
    throw new NotFoundError(
      `User with username = ${username} does not exists!`
    );

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    result: user,
  };
  return res.status(data.statusCode).json(data);
};

export const updatePassword = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}/changePassword`);

  // validate request body
  validatePasswordUpdate(req.body);

  const { currentPassword, newPassword } = req.body;
  const userId = (req.user as JwtPayload).id;

  // find user by id
  const user = await User.findById(userId);
  if (!user) {
    throw new BadRequestError("User does not exists.");
  }

  // do not allow password update for user who has registered using Google account.
  if (user.googleAuth) {
    throw new CustomAPIError(
      "You can not update the account password because you logged in using Google.",
      StatusCodes.FORBIDDEN
    );
  }

  // verify password
  const isValidPassword = await bcrypt.compare(
    currentPassword,
    user.personalInfo.password || ""
  );
  if (!isValidPassword) {
    throw new BadRequestError("Incorrect current password");
  }

  // secure new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  // update user's password
  await User.findOneAndUpdate(
    { _id: userId },
    { "personalInfo.password": hashedPassword },
    { new: true }
  );

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    result: {
      message: "Password is changed successfully",
    },
  };
  return res.status(data.statusCode).json(data);
};

export const updateUser = async (req: Request, res: Response) => {
  logger.debug(`PATCH Request on Route -> ${req.baseUrl}`);

  // validate request body
  validateUserUpdate(req.body);

  const userId = (req.user as JwtPayload).id;
  const { fullname, bio, profileImage, socialLinks } = req.body;

  const updateObj: any = {};
  if (fullname) {
    updateObj["personalInfo.fullname"] = fullname;
  }
  if (bio) {
    updateObj["personalInfo.bio"] = bio;
  }
  if (profileImage) {
    updateObj["personalInfo.profileImage"] = profileImage;
  }
  if (socialLinks) {
    for (const [key, value] of Object.entries(socialLinks)) {
      updateObj[`socialLinks.${key}`] = value;
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateObj, {
    new: true,
  }).select("-personalInfo.password -googleAuth -blogs -updatedAt -__v");

  if (!updatedUser)
    throw new CustomAPIError(
      "Some thing went wrong while updating user data.",
      StatusCodes.INTERNAL_SERVER_ERROR
    );

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    result: {
      personalInfo: updatedUser.personalInfo,
      socialLinks: updatedUser.socialLinks,
    },
  };

  return res.status(data.statusCode).json(data);
};
