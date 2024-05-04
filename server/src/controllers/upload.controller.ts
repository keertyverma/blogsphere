import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { APIResponse, APIStatus } from "../types/api-response";
import { uploadSecurely } from "../utils/cloudinary";
import logger from "../utils/logger";

export const uploadSingleImage = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}`);
  // validate request body

  const uploadedImgURL = await uploadSecurely("");

  const result: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.CREATED,
    data: {
      url: uploadedImgURL,
    },
  };
  return res.status(result.statusCode).json(result);
};
