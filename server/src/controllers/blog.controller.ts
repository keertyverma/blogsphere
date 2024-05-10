import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import { JwtPayload } from "jsonwebtoken";
import { nanoid } from "nanoid";
import { Blog } from "../models/blog.model";
import { User } from "../models/user.model";
import { APIResponse, APIStatus } from "../types/api-response";
import BadRequestError from "../utils/errors/bad-request";
import CustomAPIError from "../utils/errors/custom-api";
import logger from "../utils/logger";

const SPECIAL_CHARS_REGEX = /[^a-zA-Z0-9]/g; // find all special characters
const SPACE_REGEX = /\s+/g; // find one or more consecutives space

export const validateCreateBlog = (blog: {
  title: string;
  description: string;
  content: { blocks: [{ id: string; type: string; data: object }] };
  coverImgURL: string;
  tags: string[];
  isDraft: boolean;
}) => {
  const contentSchema = Joi.object({
    blocks: Joi.array()
      .items(
        Joi.object({
          id: Joi.string(),
          type: Joi.string().required(),
          data: Joi.object().required(),
        }).required()
      )
      .required(),
  });

  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().max(200).required(),
    content: contentSchema.required(),
    tags: Joi.array().items(Joi.string().required()).max(10).required(),
    coverImgURL: Joi.string().required(),
    isDraft: Joi.boolean(),
  });

  return schema.validate(blog);
};

const createBlog = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}`);

  // validate request body
  const { error } = validateCreateBlog(req.body);

  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  const authorId = (req.user as JwtPayload).id;
  let { title, description, content, coverImgURL, tags, isDraft } = req.body;

  // create unique blogId
  let blogId =
    title.replace(SPECIAL_CHARS_REGEX, " ").replace(SPACE_REGEX, "-").trim() +
    nanoid();

  tags = tags.map((tag: string) => tag.toLowerCase());

  //create blog
  let blog = new Blog({
    blogId,
    title,
    description,
    content,
    coverImgURL,
    tags,
    author: authorId,
    isDraft: Boolean(isDraft),
  });

  // save blog
  blog = await blog.save();

  // -----  update user document -----
  // 1. Increment total posts count when blog is published
  // 2. Add blog id to blogs array
  const user = await User.findOneAndUpdate(
    { _id: authorId },
    {
      $inc: { "accountInfo.totalPosts": blog.isDraft ? 0 : 1 },
      $push: {
        blogs: blog.id,
      },
    }
  );

  if (!user)
    throw new CustomAPIError(
      "Failed to update total posts count",
      StatusCodes.INTERNAL_SERVER_ERROR
    );

  const result: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.CREATED,
    data: {
      id: blog.blogId,
    },
  };

  return res.status(result.statusCode).json(result);
};

export { createBlog };