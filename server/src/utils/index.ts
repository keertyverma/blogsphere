import config from "config";
import { CookieOptions } from "express";
import { Types } from "mongoose";
import ms from "ms";
import { nanoid } from "nanoid";
import { User } from "../models/user.model";

export const isReservedUsername = (username: string): boolean => {
  // Reserved usernames are restricted to prevent impersonation of official accounts,
  // misuse of system-related keywords, and potential conflicts with future platform features.
  const RESERVED_KEYWORDS = new Set([
    "admin",
    "support",
    "system",
    "blogsphere",
    "blogsphere-team",
    "official",
  ]);

  return RESERVED_KEYWORDS.has(username.toLowerCase());
};

/**
 * Validates if the provided username is valid.
 * A valid username must:
 * - Be between 1 and 30 characters long.
 * - Contain only letters, numbers, hyphens (-), and underscores (_).
 * - Not be a reserved username.
 * @param username - The username to validate.
 * @returns {boolean} `true` if the username is valid, otherwise `false`.
 */
export const isUsernameValid = (username: string): boolean => {
  const USERNAME_REGEX = /^[a-zA-Z0-9_-]{1,30}$/;
  return !isReservedUsername(username) && USERNAME_REGEX.test(username);
};

const formatUsername = (username: string): string => {
  // Valid characters for the username: letters, numbers, hyphens (-), and underscores (_)
  return username
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "") // remove disallowed characters (no spaces, no symbols)
    .substring(0, 30); // trim to 30 chars
};

/**
 * Generates a unique username based on the user's full name (if provided),
 * or falls back to the email prefix if the fullname is invalid or missing.
 * It sanitizes the input (removing disallowed characters), ensures the username is within the character limit,
 * and checks for uniqueness in the database. If a conflict occurs, a random 4-character suffix is added,
 * and the process retries up to 10 times to find a unique name.
 *
 * @param email - The user's email address (used for fallback).
 * @param fullname - The user's full name (optional).
 * @returns {Promise<string>} The generated unique username.
 */
export const generateUsername = async (
  email: string,
  fullname?: string
): Promise<string> => {
  let base = "";

  // If fullname is provided, format it into a valid username
  if (fullname) {
    base = formatUsername(fullname);
  }

  // Fallback to email prefix if fullname is missing or invalid
  if (!base) {
    base = formatUsername(email.split("@")[0]);
  }

  let username = base;
  let attempt = 0;
  // Ensure uniqueness and that the username is valid
  while (
    !isUsernameValid(username) ||
    (await User.exists({ "personalInfo.username": username }))
  ) {
    // Generate a unique suffix and append it to the base username
    const suffix = nanoid(4);

    // Format the username to ensure it matches the required pattern
    username = formatUsername(`${base}-${suffix}`);
    attempt++;

    // Fail-safe after 10 attempts to prevent infinite loop in case of collisions
    if (attempt > 10) {
      throw new Error("Could not generate a unique username after 10 attempts");
    }
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
  const expiresIn = config.get<string>("expiresIn.authToken");
  let maxAge: number;

  try {
    maxAge = ms(expiresIn);
    if (typeof maxAge !== "number") {
      throw new Error(`Invalid cookie expiresIn format: ${expiresIn}`);
    }
  } catch (error) {
    console.error(
      `Invalid expiresIn value: ${expiresIn}. Falling back to default.`
    );
    maxAge = ms("7d"); // Use a default duration of 7 days
  }

  return {
    httpOnly: true, // Prevents JavaScript from accessing the cookie. Helps mitigate XSS attacks
    sameSite: "strict", // Mitigate Cross-Site Request Forgery (CSRF) attack
    secure: isProduction, // Ensures cookie is sent only over HTTPS in production
    domain: isProduction ? ".sooprr.com" : "localhost",
    path: "/api/v1/", // Ensures cookie is accessible only within a specific subset of URLs within the domain that begin with /api/v1/
    maxAge, // Cookie's lifetime in milliseconds. After this time, the cookie will expire and be removed from the client’s browser.
  };
};

const handleTimeZoneAbbreviation = (timeZone: string): string => {
  // To map time zone offsets to abbreviations
  const timeZoneMap: Record<string, string> = {
    "GMT+5:30": "IST", // India Standard Time
    "GMT-8:00": "PST", // Pacific Standard Time
    "GMT+0:00": "UTC", // Coordinated Universal Time
    // ...Add more time zone mappings as needed
  };

  return timeZoneMap[timeZone] || timeZone;
};

export const getFormattedExpiryDate = (date: Date): string => {
  // Format the provided date as a local string in the format: Month DD, YYYY at H:M

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric", // "2024"
    month: "long", // "July"
    day: "numeric", // "30"
    hour: "2-digit", // "10"
    minute: "2-digit", // "52"
    hour12: true, // "PM"
  };

  // Get the formatted date based on the local time zone
  const formattedExpiresAt = date.toLocaleString("en-US", options);

  // Detect the time zone
  const timeZone =
    new Intl.DateTimeFormat("en-US", { timeZoneName: "short" })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value || "UTC";

  // Handle known time zone offsets (e.g., GMT+5:30 -> IST)
  const timeZoneAbbreviation = handleTimeZoneAbbreviation(timeZone);

  // Return the formatted expiry date along with the time zone information
  const formattedExpiryWithTimeZone = `${formattedExpiresAt} (${timeZoneAbbreviation})`;

  return formattedExpiryWithTimeZone;
};

export const isValidCursor = (cursor: string): boolean => {
  // Cursor valid format -> `<timestamp>_<id>`
  const [timestamp, id] = (cursor as string).split("_");

  if (!timestamp || !id) return false;

  // Ensure `timestamp` is a valid ISO 8601 string by checking its format and parsing result
  const date = new Date(timestamp);
  if (
    isNaN(date.getTime()) || // Ensures it's a valid date
    timestamp !== date.toISOString() // Ensures exact format match
  ) {
    return false;
  }

  // Ensure `id` is a valid MongoDB ObjectId
  if (!Types.ObjectId.isValid(id)) return false;

  return true;
};
