import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

import crypto from "crypto";
import { User } from "../models/user.model";
import { APIResponse, APIStatus } from "../types/api-response";
import { generateUsername, getCookieOptions } from "../utils";
import BadRequestError from "../utils/errors/bad-request";
import CustomAPIError from "../utils/errors/custom-api";
import FirebaseAuthError from "../utils/errors/firebase-error";
import { verifyIdToken } from "../utils/firebase-auth";
import logger from "../utils/logger";
import { sendResetPasswordEmail, sendVerificationEmail } from "../utils/mailer";

const _validateAuthUser = (data: { email: string; password: string }) => {
  const schema = Joi.object({
    email: Joi.string()
      .trim() // Remove leading/trailing spaces
      .required() // Ensure email is provided
      .max(255) // Limit email length to 255 characters (RFC 5321 standard)
      .email()
      .messages({
        "string.empty": "Email is required.", // Empty string case
        "any.required": "Email is required.", // Missing value case
        "string.email": "Invalid email format.", // Invalid email format
        "string.max": "Email must be at most 255 characters long.",
      }),
    password: Joi.string().required().messages({
      "string.empty": "Password is required.",
      "any.required": "Password is required.",
    }),
  });

  const { error, value } = schema.validate(data);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  return value;
};

const authenticateUser = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}`);

  // validate request body
  const { email, password } = _validateAuthUser(req.body);

  // check if user exists
  const user = await User.findOne({ "personalInfo.email": email });
  if (!user) {
    throw new BadRequestError("Invalid email or password");
  }

  // if googleAuth is set then ask user to login with google option
  if (user.googleAuth) {
    throw new CustomAPIError(
      "Account was created using Google. Please log in using Google.",
      StatusCodes.FORBIDDEN
    );
  }

  // check if user is verified
  if (!user.isVerified) {
    throw new BadRequestError("Account is not verified.");
  }
  // verify password
  const isValidPassword = await bcrypt.compare(
    password,
    user.personalInfo.password || ""
  );
  if (!isValidPassword) {
    throw new BadRequestError("Invalid email or password");
  }

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    result: {
      id: user.id,
      fullname: user.personalInfo?.fullname,
      email: user.personalInfo?.email,
      username: user.personalInfo?.username,
      profileImage: user.personalInfo.profileImage,
    },
  };

  // send token inside cookies (`HTTP-only` secure)
  const accessToken = user.generateAuthToken();
  return res
    .cookie("authToken", accessToken, getCookieOptions())
    .status(data.statusCode)
    .json(data);
};

const validateGoogleAuth = (req: { accessToken: string }) => {
  const schema = Joi.object({
    accessToken: Joi.string().required(),
  });

  return schema.validate(req);
};

const authenticateWithGoogle = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}`);
  // validate request body
  const { error } = validateGoogleAuth(req.body);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  try {
    // verify access token
    const { accessToken } = req.body;
    const decodedUser = await verifyIdToken(accessToken);
    let { email, name, picture } = decodedUser;

    // get high resolution user picture
    picture = picture?.replace("s96-c", "s384-c");

    // get user by email
    let user = await User.findOne({ "personalInfo.email": email });
    if (user) {
      if (!user.googleAuth) {
        // do not allow user to continue with google authentication
        throw new CustomAPIError(
          "This email address was registered without using Google sign-in. Please use your password to log in and access the account",
          StatusCodes.FORBIDDEN
        );
      }
    } else {
      // create user
      const username = await generateUsername(email || "");
      user = new User({
        personalInfo: {
          fullname: name,
          email,
          username,
          profileImage: picture,
        },
        googleAuth: true,
        isVerified: true,
      });
      await user.save();
    }

    const data: APIResponse = {
      status: APIStatus.SUCCESS,
      statusCode: StatusCodes.OK,
      result: {
        id: user.id,
        fullname: user.personalInfo?.fullname,
        email: user.personalInfo?.email,
        username: user.personalInfo?.username,
        profileImage: user.personalInfo.profileImage,
      },
    };

    // send token inside cookies (`HTTP-only` secure)
    const userAccessToken = user.generateAuthToken();
    return res
      .cookie("authToken", userAccessToken, getCookieOptions())
      .status(data.statusCode)
      .json(data);
  } catch (error) {
    const err = error as FirebaseAuthError;
    if (err.code === "auth/argument-error") {
      throw new BadRequestError("Invalid Access Token");
    } else if (err.code === "auth/id-token-expired") {
      throw new BadRequestError("Access Token has expired");
    } else {
      throw error;
    }
  }
};

const logout = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}/logout`);

  // clear token cookie
  res.clearCookie("authToken", getCookieOptions());
  res.status(200).json({ message: "Logout successful" });
};

const _validateVerifyUserAccount = (data: { email: string; token: string }) => {
  const schema = Joi.object({
    email: Joi.string().trim().required(),
    token: Joi.string().trim().required(),
  });

  const { error, value: validatedData } = schema.validate(data);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  return validatedData;
};

const verifyEmail = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}/verify-email`);

  // validate request body
  const { email, token } = _validateVerifyUserAccount(req.body);

  const hashToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find the user by email and verification token
  const user = await User.findOne({
    "personalInfo.email": email,
    $or: [{ "verificationToken.token": hashToken }, { isVerified: true }],
  });
  if (!user) {
    throw new BadRequestError("Invalid Verification link");
  }

  // check if the user's email is already verified
  if (user.isVerified) {
    const data: APIResponse = {
      status: APIStatus.SUCCESS,
      statusCode: StatusCodes.OK,
      message: "Email is already verified.",
    };

    return res.status(data.statusCode).json(data);
  }

  // check for token expiration
  if (user.verificationToken && user.verificationToken.expiresAt < new Date()) {
    throw new BadRequestError(
      "Verification link expired. Please request a new one"
    );
  }

  // update user status to verified
  user.isVerified = true;
  // clear the verification token and expiry
  user.verificationToken = undefined;
  await user.save();

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    message: "Email verified successfully.",
  };

  return res.status(data.statusCode).json(data);
};

const _validateResendVerification = (data: { email: string }) => {
  const schema = Joi.object({
    email: Joi.string().trim().required(),
  });

  const { error, value: validatedData } = schema.validate(data);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  return validatedData;
};

const resendVerification = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}/resend-verification`);

  // validate req body
  const { email } = _validateResendVerification(req.body);

  // find the user by email
  const user = await User.findOne({ "personalInfo.email": email });
  if (user) {
    if (user.isVerified) {
      throw new BadRequestError("Account already verified.");
    }

    // check for token expiration
    const tokenExpired = user.verificationToken?.expiresAt
      ? new Date(user.verificationToken.expiresAt).getTime() < Date.now()
      : true;

    if (!tokenExpired) {
      throw new BadRequestError("An active verification token already exists.");
    }

    // get verification token
    const { token, hashedToken, expiresAt } = user.generateVerificationToken();

    // set verification token and expiration date
    user.verificationToken = {
      token: hashedToken,
      expiresAt,
    };

    try {
      await sendVerificationEmail(email, token, expiresAt);
      await user.save();
      logger.info(`Verification email sent successfully to = ${email}`);
    } catch (error) {
      logger.error(`Failed to send verification email to ${email}`);
      if (error instanceof Error) {
        logger.error(`Error: ${error.message}`);
      }
      throw new CustomAPIError(
        "We encountered an issue sending the verification email. Please try again later.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  } else {
    // Avoid explicit notification and do not throw error for unregistered emails.
    logger.info(
      `Account verification request for non-existent email: ${email}`
    );
  }

  // Generic success response
  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    message:
      "If the email is associated with an account, a verfication email will be sent.",
  };

  return res.status(data.statusCode).json(data);
};

const _validateForgotPassword = (data: { email: string }) => {
  const schema = Joi.object({
    email: Joi.string().trim().required(),
  });

  const { error, value: validatedData } = schema.validate(data);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  return validatedData;
};

const forgotPassword = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}/forgot-password`);

  // validate req body
  const { email } = _validateForgotPassword(req.body);

  // find the user by email
  const user = await User.findOne({ "personalInfo.email": email });
  if (user) {
    // check for token expiration
    const tokenExpired = user.resetPasswordToken?.expiresAt
      ? new Date(user.resetPasswordToken.expiresAt).getTime() < Date.now()
      : true;

    if (!tokenExpired) {
      throw new BadRequestError(
        "An active password reset token already exists."
      );
    }

    // get reset password token
    const { token, hashedToken, expiresAt } = user.generateResetPasswordToken();

    // set reset password token and expiration date
    user.resetPasswordToken = {
      token: hashedToken,
      expiresAt,
    };

    try {
      await sendResetPasswordEmail(email, token, expiresAt);
      await user.save();
      logger.info(`Password reset email sent successfully: ${email}`);
    } catch (error) {
      logger.error(`Failed to send password reset email to ${email}`);
      if (error instanceof Error) {
        logger.error(`Error: ${error.message}`);
      }
      throw new CustomAPIError(
        "We encountered an issue sending the password reset email. Please try again later.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  } else {
    // Avoid explicit notification and do not throw error for unregistered emails.
    logger.info(`Password reset request for non-existent email: ${email}`);
  }

  // Generic success response
  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    message:
      "If the email is associated with an account, a password reset email will be sent.",
  };

  return res.status(data.statusCode).json(data);
};

const _validateResetPassword = (data: {
  email: string;
  token: string;
  password: string;
}) => {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;

  const schema = Joi.object({
    email: Joi.string().trim().required(),
    token: Joi.string().trim().required(),
    password: Joi.string()
      .min(5)
      .max(1024)
      .trim()
      .required()
      .pattern(passwordRegex)
      .message(
        "Password must be 8 to 20 characters long and contain at least 1 numeric digit, 1 lowercase letter and 1 uppercase letter."
      ),
  });

  const { error, value: validatedData } = schema.validate(data);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  return validatedData;
};
const resetPassword = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}/reset-password`);

  // validate request body
  const { email, token, password } = _validateResetPassword(req.body);

  // Find the user by email and reset password token
  const hashToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    "personalInfo.email": email,
    "resetPasswordToken.token": hashToken,
  });
  if (!user) {
    throw new BadRequestError("Invalid Password Reset link");
  }

  // check for token expiration
  if (
    user.resetPasswordToken &&
    user.resetPasswordToken.expiresAt < new Date()
  ) {
    throw new BadRequestError(
      "Password Reset link expired. Please request a new one"
    );
  }

  // secure password and update user
  const hashedPassword = await bcrypt.hash(password, 10);
  user.personalInfo.password = hashedPassword;

  // clear the reset password token and expiry
  user.resetPasswordToken = undefined;
  await user.save();

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    message: "Password reset completed successfully.",
  };
  return res.status(data.statusCode).json(data);
};

export {
  authenticateUser,
  authenticateWithGoogle,
  forgotPassword,
  logout,
  resendVerification,
  resetPassword,
  verifyEmail,
};
