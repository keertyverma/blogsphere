import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { User, validateUser } from "../models/user.model";
import logger from "../utils/logger";

export const createUser = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}`);

  // validate request body
  const { error } = validateUser(req.body);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    return res.status(400).json({ error: errorMessage });
  }

  const { fullName, email, password } = req.body;
  // check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "User already registered." });
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

  return res.json({
    _id: user.id,
    name: user.personalInfo?.fullName,
    email: user.personalInfo?.email,
    username: user.personalInfo?.username,
  });
};
