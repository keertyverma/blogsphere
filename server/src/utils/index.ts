import { CookieOptions } from "express";
import { nanoid } from "nanoid";
import { User } from "../models/user.model";

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

export const getCookieOptions = (): CookieOptions => {
  // cookies option to create secure cookies
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true, // Prevents JavaScript from accessing the cookie. Helps mitigate XSS attacks
    sameSite: "strict", // Mitigate Cross-Site Request Forgery (CSRF) attack
    secure: isProduction, // Ensures cookie is sent only over HTTPS in production
    domain: isProduction ? ".360verse.co" : "localhost",
    path: "/api/v1/", // Ensures cookie is accessible only within a specific subset of URLs within the domain that begin with /api/v1/
  };
};
