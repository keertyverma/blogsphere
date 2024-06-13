import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import { JwtPayload } from "jsonwebtoken";
import { User, validateUser } from "../models/user.model";
import { APIResponse, APIStatus } from "../types/api-response";
import { generateUsername } from "../utils";
import BadRequestError from "../utils/errors/bad-request";
import CustomAPIError from "../utils/errors/custom-api";
import NotFoundError from "../utils/errors/not-found";
import logger from "../utils/logger";

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

  const result: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.CREATED,
    data: {
      id: user.id,
      fullname: user.personalInfo?.fullname,
      email: user.personalInfo?.email,
      username: user.personalInfo?.username,
      profileImage: user.personalInfo.profileImage,
    },
  };
  return res
    .header("x-auth-token", accessToken)
    .status(result.statusCode)
    .json(result);
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
      "personalInfo.fullname personalInfo.username personalInfo.profileImage -_id"
    );

  const result: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    data: users,
  };

  return res.status(result.statusCode).json(result);
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

  const result: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    data: user,
  };
  return res.status(result.statusCode).json(result);
};

const validatePasswordUpdate = (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;

  const schema = Joi.object({
    currentPassword: Joi.string()
      .min(5)
      .max(1024)
      .required()
      .pattern(passwordRegex)
      .message(
        "Current Password must be 8 to 20 characters long and contain at least 1 numeric digit, 1 lowercase letter and 1 uppercase letter."
      ),
    newPassword: Joi.string()
      .min(5)
      .max(1024)
      .required()
      .pattern(passwordRegex)
      .message(
        "New Password must be 8 to 20 characters long and contain at least 1 numeric digit, 1 lowercase letter and 1 uppercase letter."
      ),
  });

  const { error } = schema.validate(data);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }
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

  const result: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    data: {
      message: "Password is changed successfully",
    },
  };
  return res.status(result.statusCode).json(result);
};
