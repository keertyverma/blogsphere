import { User } from "../models/user.model";
import { nanoid } from "nanoid";

export const generateUsername = async (email: string): Promise<string> => {
  let username = email.split("@")[0];

  let existingUser = await User.findOne({ "personalInfo.username": username });
  if (existingUser) {
    username = username + nanoid().toString().substring(0, 5);
  }

  return username;
};
