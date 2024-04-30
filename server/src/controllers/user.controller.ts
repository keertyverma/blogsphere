import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { User, validateUser } from "../models/user.model";
import { APIResponse, APIStatus } from "../types/api-response";
import BadRequestError from "../utils/errors/bad-request";
import logger from "../utils/logger";
import { generateUsername } from "../utils";

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
