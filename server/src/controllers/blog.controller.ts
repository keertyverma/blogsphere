import { OutputData } from "@editorjs/editorjs";
import { Request, Response } from "express";
import Joi from "joi";
import { JwtPayload } from "jsonwebtoken";
import BadRequestError from "../utils/errors/bad-request";
import logger from "../utils/logger";

export const validateCreateBlog = (blog: {
  title: string;
  description: string;
  content: OutputData;
  coverImgURL: string;
  tags: string[];
  isDraft: boolean;
}) => {
  const outputDataSchema = Joi.object({
    version: Joi.string(),
    time: Joi.number(),
    blocks: Joi.array().items(
      Joi.object({
        id: Joi.string(),
        type: Joi.string().required(),
        data: Joi.object().required(),
      })
    ),
  });

  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().max(200).required(),
    content: outputDataSchema.required(),
    tags: Joi.array().items(Joi.string().required()).max(10).required(),
    coverImgURL: Joi.string().required(),
    isDraft: Joi.boolean(),
  });

  return schema.validate(blog);
};

const createBlog = (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}`);

  // validate request body
  const { error } = validateCreateBlog(req.body);

  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  const user = req.user as JwtPayload;
  let { title, description, content, coverImgURL, tags, isDraft } = req.body;

  // replace all special characters in title with space (excluding - small alphabets, capital alphabets and digits) to " "
  let blogId = title.replace(/[^a-zA-Z0-9]/g, " ");

  tags = tags.maps((tag: string) => tag.toLowerCase());

  //TODO: create blog
  return res.json({});
};

export { createBlog };
