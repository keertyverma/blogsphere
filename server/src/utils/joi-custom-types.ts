import Joi from "joi";
import { isValidObjectId } from "mongoose";

// Create a custom Joi extension to validate MongoDB ObjectIds.
const mongoIdValidator = Joi.extend((joi) => ({
  type: "objectId",
  base: joi.string(),
  messages: {
    "objectId.invalid": "{{#label}} must be a valid ID",
  },
  validate(value, helper) {
    if (!isValidObjectId(value)) {
      return { value, errors: helper.error("objectId.invalid") };
    }
    return { value };
  },
}));

export { mongoIdValidator };
