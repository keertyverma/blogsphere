import Joi from "joi";
import { Types } from "mongoose";

// Define a function to validate if a string is in the correct format for MongoDB ObjectId
const isValidMongoObjectId = (value: string): boolean => {
  return Types.ObjectId.isValid(value);
};

// Create a custom Joi extension to validate MongoDB ObjectIds.
const mongoIdValidator = Joi.extend((joi) => ({
  type: "objectId",
  base: joi.string(),
  messages: {
    "objectId.invalid": "{{#label}} must be a valid MongoDB ObjectId",
  },
  validate(value, helper) {
    if (!isValidMongoObjectId(value)) {
      return { value, errors: helper.error("objectId.invalid") };
    }
    return { value };
  },
}));

export { mongoIdValidator };
