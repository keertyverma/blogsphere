import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import { JwtPayload } from "jsonwebtoken";
import { Types, isValidObjectId } from "mongoose";
import { nanoid } from "nanoid";
import { Blog } from "../models/blog.model";
import { User } from "../models/user.model";
import { SortQuery } from "../types";
import { APIResponse, APIStatus } from "../types/api-response";
import BadRequestError from "../utils/errors/bad-request";
import CustomAPIError from "../utils/errors/custom-api";
import { mongoIdValidator } from "../utils/joi-custom-types";
import logger from "../utils/logger";
import NotFoundError from "../utils/errors/not-found";

const SPECIAL_CHARS_REGEX = /[^a-zA-Z0-9]/g; // find all special characters
const SPACE_REGEX = /\s+/g; // find one or more consecutives space

const validateCreateBlog = (blog: any, isDraft: boolean) => {
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

  const draftBlogSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().min(0).max(200),
    content: contentSchema,
    tags: Joi.array().items(Joi.string()).max(10),
    coverImgURL: Joi.string().min(0),
    isDraft: Joi.boolean(),
  });

  const publishBlogSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().max(200).required(),
    content: contentSchema.required(),
    tags: Joi.array().items(Joi.string().required()).max(10).required(),
    coverImgURL: Joi.string(),
    isDraft: Joi.boolean(),
  });

  const schema = isDraft ? draftBlogSchema : publishBlogSchema;

  const { error } = schema.validate(blog);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }
};

const createBlog = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}`);

  const isDraft = Boolean(req.body.isDraft);

  // validate request body
  validateCreateBlog(req.body, isDraft);

  const authorId = (req.user as JwtPayload).id;
  let { title, description, content, coverImgURL, tags } = req.body;

  // create unique blogId
  let blogId =
    title.replace(SPECIAL_CHARS_REGEX, " ").replace(SPACE_REGEX, "-").trim() +
    nanoid();

  tags = tags?.map((tag: string) => tag.toLowerCase());

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

const validateBlogQueryParams = (query: any) => {
  const schema = Joi.object({
    tag: Joi.string(),
    search: Joi.string(),
    ordering: Joi.string(),
    authorId: mongoIdValidator.objectId(),
    limit: Joi.number(),
  });

  const { error } = schema.validate(query);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }
};

const getLatestBlogs = async (req: Request, res: Response) => {
  logger.debug(`GET Request on Route -> ${req.baseUrl}`);

  // validate request query params
  validateBlogQueryParams(req.query);

  const { tag, authorId, search, ordering, limit } = req.query;

  const max_limit = limit ? parseInt(limit as string) : 5;

  const matchQuery: any = {
    isDraft: false,
    ...(authorId && { author: new Types.ObjectId(authorId as string) }),
    ...(tag && { tags: (tag as string).toLowerCase() }),
  };

  const searchQuery: any = search
    ? {
        $or: [
          { title: new RegExp(`${search}`, "i") },
          {
            "authorDetails.personalInfo.fullname": new RegExp(`${search}`, "i"),
          },
          {
            "authorDetails.personalInfo.username": new RegExp(`${search}`, "i"),
          },
        ],
      }
    : {};

  const sortQuery: SortQuery =
    ordering && (ordering as string).toLowerCase() === "trending"
      ? {
          "activity.totalReads": -1,
          "activity.totalLikes": -1,
          createdAt: -1,
        }
      : { createdAt: -1 };

  const blogs = await Blog.aggregate([
    {
      $match: matchQuery,
    },
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "authorDetails",
      },
    },
    {
      $unwind: "$authorDetails",
    },
    {
      $match: searchQuery,
    },
    {
      $sort: sortQuery,
    },
    {
      $limit: max_limit,
    },
    {
      $project: {
        _id: 0,
        blogId: 1,
        title: 1,
        description: 1,
        coverImgURL: 1,
        tags: 1,
        activity: 1,
        createdAt: 1,
        "authorDetails.personalInfo.fullname": 1,
        "authorDetails.personalInfo.username": 1,
        "authorDetails.personalInfo.profileImage": 1,
      },
    },
  ]);

  const result: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    data: blogs,
  };

  return res.status(result.statusCode).json(result);
};

const getBlogById = async (req: Request, res: Response) => {
  logger.debug(`GET Request on Route -> ${req.baseUrl}/:blogId`);

  const { blogId } = req.params;
  const blog = await Blog.findOne({ blogId })
    .populate(
      "author",
      "personalInfo.fullname personalInfo.username personalInfo.profileImage -_id"
    )
    .select(
      "blogId title description content coverImgURL tags activity createdAt -_id"
    );

  if (!blog) throw new NotFoundError(`No blog found with blogId = ${blogId}`);

  const result: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    data: blog,
  };

  return res.status(result.statusCode).json(result);
};

export { createBlog, getLatestBlogs, getBlogById };
