import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import { APIResponse, APIStatus } from "../types/api-response";
import { uploadSecurely } from "../utils/cloudinary";
import BadRequestError from "../utils/errors/bad-request";
import logger from "../utils/logger";

const validate = (req: { data: string }) => {
  // data -> data URI of file in base64 encoding string
  const schema = Joi.object({
    data: Joi.string()
      .required()
      .pattern(/^data:(image\/\w+);base64,([A-Za-z0-9+/=]+)/)
      .message("Invalid data URI format. It must be encoded in base64"),
  });

  return schema.validate(req);
};

export const uploadSingleImage = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}`);
  // validate request body
  const { error } = validate(req.body);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  const { data } = req.body;
  const uploadedImgURL = await uploadSecurely(data);
  const result: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.CREATED,
    data: {
      url: uploadedImgURL,
    },
  };

  return res.status(result.statusCode).json(result);
};
