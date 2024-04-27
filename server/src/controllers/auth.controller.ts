import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import { User } from "../models/user.model";
import { APIResponse, APIStatus } from "../types/api-response";
import BadRequestError from "../utils/errors/bad-request";
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

  // verify password
  const isValidPassword = await bcrypt.compare(
    password,
    user.personalInfo.password
  );
  if (!isValidPassword) {
    throw new BadRequestError("Invalid email or password");
  }

  const accessToken = user.generateAuthToken();
  const result: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    data: {
      _id: user.id,
      fullname: user.personalInfo?.fullname,
      email: user.personalInfo?.email,
      username: user.personalInfo?.username,
    },
  };

  return res
    .header("x-auth-token", accessToken)
    .status(result.statusCode)
    .json(result);
};

export { authenticateUser };
