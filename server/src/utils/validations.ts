import Joi from "joi";
import { isValidUrl } from ".";
import { IUserUpdate } from "../types/api-response";
import BadRequestError from "./errors/bad-request";
import logger from "./logger";

export const validateUserUpdate = (data: IUserUpdate) => {
  const schema = Joi.object({
    fullname: Joi.string().trim().min(2).max(50),
    bio: Joi.string().trim().max(200).allow(""),
    profileImage: Joi.string().trim(),
    socialLinks: Joi.object({
      youtube: Joi.string()
        .trim()
        .allow("")
        .custom((value, helpers) => {
          if (!isValidUrl(value)) {
            return helpers.error("any.invalid");
          }
          return value;
        }),
      instagram: Joi.string()
        .trim()
        .allow("")
        .custom((value, helpers) => {
          if (!isValidUrl(value)) {
            return helpers.error("any.invalid");
          }
          return value;
        }),
      facebook: Joi.string()
        .trim()
        .allow("")
        .custom((value, helpers) => {
          if (!isValidUrl(value)) {
            return helpers.error("any.invalid");
          }
          return value;
        }),
      twitter: Joi.string()
        .trim()
        .allow("")
        .custom((value, helpers) => {
          if (!isValidUrl(value)) {
            return helpers.error("any.invalid");
          }
          return value;
        }),
      github: Joi.string()
        .trim()
        .allow("")
        .custom((value, helpers) => {
          if (!isValidUrl(value)) {
            return helpers.error("any.invalid");
          }
          return value;
        }),
      website: Joi.string()
        .trim()
        .allow("")
        .custom((value, helpers) => {
          if (!isValidUrl(value)) {
            return helpers.error("any.invalid");
          }
          return value;
        }),
    }),
  });

  const { error } = schema.validate(data);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }
};

export const validatePasswordUpdate = (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;

  const schema = Joi.object({
    currentPassword: Joi.string().min(5).max(1024).required(),
    newPassword: Joi.string()
      .min(5)
      .max(1024)
      .required()
      .pattern(passwordRegex)
      .message(
        "New Password must be 8 to 20 characters long and contain at least 1 numeric digit, 1 lowercase letter and 1 uppercase letter."
      ),
  });

  const { error } = schema.validate(data);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }
};
