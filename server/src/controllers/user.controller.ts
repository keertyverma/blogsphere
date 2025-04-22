import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import escapeStringRegexp from "escape-string-regexp";

import { User, validateUser } from "../models/user.model";
import { APIResponse, APIStatus } from "../types/api-response";
import { generateUsername } from "../utils";
import BadRequestError from "../utils/errors/bad-request";
import CustomAPIError from "../utils/errors/custom-api";
import NotFoundError from "../utils/errors/not-found";
import logger from "../utils/logger";
import { sendVerificationEmail } from "../utils/mailer";
import {
  validatePasswordUpdate,
  validateUsernameUpdate,
  validateUserUpdate,
} from "../utils/validations";

// Reserved usernames that cannot be used to prevent impersonation or system conflicts
const RESERVED_KEYWORDS = [
  "admin",
  "support",
  "system",
  "blogsphere",
  "blogsphere-team",
  "official",
];

export const createUser = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}`);

  // validate request body
  const { error, value: validatedData } = validateUser(req.body);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  const { fullname, email, password } = validatedData;
  // check if user exists
  const existingUser = await User.findOne({ "personalInfo.email": email });
  if (existingUser) {
    throw new BadRequestError(`An account with this email already exists.`);
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

  // get verification token
  const { token, hashedToken, expiresAt } = user.generateVerificationToken();

  // set verification token and expiration date
  user.verificationToken = {
    token: hashedToken,
    expiresAt,
  };

  // generate verification link and send verification email
  try {
    await sendVerificationEmail(email, token, expiresAt);
    await user.save();
    logger.info("Verification email sent successfully.");
  } catch (error) {
    logger.error(`Failed to send verification email to ${email}`);
    if (error instanceof Error) {
      logger.error(`Error: ${error.message}`);
    }
    throw new CustomAPIError(
      "Registration completed, but we encountered an issue sending the verification email. Please try again later.",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

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
    message:
      "Registration successfull!.Please check your email to verify your account.",
  };

  return res.status(data.statusCode).json(data);
};

export const getUsers = async (req: Request, res: Response) => {
  logger.debug(`GET Request on Route -> ${req.baseUrl}`);

  const { search, limit } = req.query;

  const max_limit = limit ? parseInt(limit as string) : 10;

  // Escape the search string to ensure it's safely used in a regular expression, preventing any special characters from causing errors
  const safeSearchString = search ? escapeStringRegexp(search as string) : null;
  const regexQuery = { $regex: `${safeSearchString}`, $options: "i" };

  const findQuery = {
    isVerified: true,
    ...(safeSearchString && {
      $or: [
        { "personalInfo.username": regexQuery },
        { "personalInfo.fullname": regexQuery },
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

  const user = await User.findOne({
    "personalInfo.username": username,
    isVerified: true,
  }).select(
    "-personalInfo.password -personalInfo.email -googleAuth -blogs -updatedAt -__v"
  );
  if (!user)
    throw new NotFoundError(`User with username = ${username} does not exist!`);

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
  updateObj["personalInfo.bio"] = bio;
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

export const updateUsername = async (req: Request, res: Response) => {
  logger.debug(`PATCH Request on Route -> ${req.baseUrl}/changeUsername`);

  // Enforce one-time username change policy.
  // - Users are allowed to change their username only once to maintain consistency and prevent abuse.
  const userId = (req.user as JwtPayload).id;
  const user = await User.findById(userId).select("usernameChanged").lean();
  if (user?.usernameChanged) {
    throw new CustomAPIError(
      "You’ve already changed your username. This action is allowed only once.",
      StatusCodes.FORBIDDEN
    );
  }

  // Verify the username format
  const { error, value: validatedData } = validateUsernameUpdate(req.body);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  const { newUsername } = validatedData;
  const normalizedUsername = newUsername.toLowerCase();

  // Check if the username has already been taken
  const isUsernameExists = await User.exists({
    "personalInfo.username": normalizedUsername,
  });
  if (isUsernameExists) {
    throw new BadRequestError("This username is already taken.");
  }

  // Ensure the username is not a reserved keyword
  // - Reserved usernames are restricted to prevent impersonation of official accounts,
  // - misuse of system-related keywords, and potential conflicts with future platform features.
  if (RESERVED_KEYWORDS.includes(normalizedUsername)) {
    throw new BadRequestError("This username is reserved and cannot be used.");
  }

  // Set new username
  const updateResult = await User.updateOne(
    { _id: userId },
    {
      $set: {
        "personalInfo.username": normalizedUsername,
        usernameChanged: true,
      },
    }
  );

  if (!updateResult.modifiedCount) {
    throw new CustomAPIError(
      "Failed to update username.",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    result: {
      message: "Username updated successfully.",
      username: normalizedUsername,
    },
  };
  return res.status(data.statusCode).json(data);
};
