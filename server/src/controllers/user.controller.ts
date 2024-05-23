import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { User, validateUser } from "../models/user.model";
import { APIResponse, APIStatus } from "../types/api-response";
import { generateUsername } from "../utils";
import BadRequestError from "../utils/errors/bad-request";
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
