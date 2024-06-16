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

export const isValidUrl = (url: string) => {
  // List of valid top-level domains (TLDs)
  const validTLDs = [
    "com",
    "org",
    "net",
    "edu",
    "gov",
    "mil",
    "co",
    "io",
    "ai",
    "in",
  ]; // Add more as needed

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    const tld = hostname.substring(hostname.lastIndexOf(".") + 1);
    return validTLDs.includes(tld);
  } catch (e) {
    return false;
  }
};
