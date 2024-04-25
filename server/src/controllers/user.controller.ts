import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { User, validateUser } from "../models/user.model";
import logger from "../utils/logger";
import BadRequestError from "../utils/errors/bad-request";
import { APIResponse, APIStatus } from "../types/api-response";
import { StatusCodes } from "http-status-codes";

export const createUser = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}`);

  // validate request body
  const { error } = validateUser(req.body);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  const { fullName, email, password } = req.body;
  // check if user exists
  const existingUser = await User.findOne({ "personalInfo.email": email });
  if (existingUser) {
    throw new BadRequestError(`User already registered.`);
  }

  // secure password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create user
  const user = new User({
    personalInfo: {
      fullName,
      email,
      password: hashedPassword,
      username: email.split("@")[0],
    },
  });
  await user.save();

  const result: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.CREATED,
    data: {
      _id: user.id,
      name: user.personalInfo?.fullName,
      email: user.personalInfo?.email,
      username: user.personalInfo?.username,
    },
  };
  return res.status(result.statusCode).json(result);
};
