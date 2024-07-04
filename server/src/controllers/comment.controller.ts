import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import { JwtPayload } from "jsonwebtoken";
import { isValidObjectId } from "mongoose";
import { Blog } from "../models/blog.model";
import { Comment, IComment } from "../models/comment.model";
import { APIResponse, APIStatus } from "../types/api-response";
import BadRequestError from "../utils/errors/bad-request";
import NotFoundError from "../utils/errors/not-found";
import { mongoIdValidator } from "../utils/joi-custom-types";
import logger from "../utils/logger";

const validateCreateComment = (data: {
  blogId: string;
  blogAuthor: string;
  content: string;
}) => {
  const schema = Joi.object({
    blogId: mongoIdValidator.objectId().trim().required(),
    blogAuthor: mongoIdValidator.objectId().trim().required(),
    content: Joi.string().trim().required(),
  });

  const { error, value: validatedData } = schema.validate(data);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  return validatedData;
};

export const createComment = async (req: Request, res: Response) => {
  logger.debug(`${req.method} Request on Route -> ${req.baseUrl}/`);

  // validate request body
  const { blogId, blogAuthor, content } = validateCreateComment(req.body);
  const userId = (req.user as JwtPayload).id;

  //   check if blog exists
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new NotFoundError(`Blog with id = ${blogId} not found.`);
  }

  // create comment
  let comment = new Comment({
    blogId,
    blogAuthor,
    content,
    commentedBy: userId,
  });

  // save comment
  comment = await comment.save();

  // update blog
  // - add comment in 'comments' array
  // - increment 'totalComments' and 'totalParentComments' count by 1
  const updatedBlog = await Blog.findByIdAndUpdate(
    blogId,
    {
      $inc: { "activity.totalComments": 1, "activity.totalParentComments": 1 },
    },
    { new: true }
  ).select("_id blogId author");

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.CREATED,
    result: {
      id: comment.id,
      blog: {
        id: updatedBlog?._id,
        blogId: updatedBlog?.blogId,
        author: updatedBlog?.author,
      },
      commentedBy: comment.commentedBy,
      content: comment.content,
    },
  };

  return res.status(data.statusCode).json(data);
};

const validateCommentQueryParams = (query: {
  blogId?: string;
  page?: number;
  pageSize?: number;
  commentId?: string;
}) => {
  const schema = Joi.object({
    blogId: mongoIdValidator.objectId(),
    page: Joi.number(),
    pageSize: Joi.number(),
    commentId: mongoIdValidator.objectId(),
  });

  const { error } = schema.validate(query);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }
};

export const getAllComments = async (req: Request, res: Response) => {
  logger.debug(`${req.method} Request on Route -> ${req.baseUrl}/`);

  // validate request query params
  validateCommentQueryParams(req.query);

  const { blogId, commentId, page = 1, pageSize = 10 } = req.query;
  const max_limit = parseInt(pageSize as string);
  const skip = (parseInt(page as string) - 1) * max_limit;
  const matchQuery: any = {
    ...(blogId && { blogId }),
    isReply: commentId ? true : false,
    ...(commentId && { parent: commentId }),
  };

  let nextPage: string | null;
  let previousPage: string | null;
  let comments: IComment[];

  // get total comments count
  const totalCount = await Comment.countDocuments(matchQuery);
  if (totalCount === 0) {
    nextPage = null;
    previousPage = null;
    comments = [];
  } else {
    comments = await Comment.find(matchQuery)
      .populate(
        "commentedBy",
        "personalInfo.fullname personalInfo.username personalInfo.profileImage -_id"
      )
      .sort({ commentedAt: -1 })
      .skip(skip)
      .limit(max_limit)
      .select("-__v");

    // set previous and next url for pagination
    const queryParams = new URLSearchParams(req.query as any);
    queryParams.delete("page");
    queryParams.delete("pageSize");

    const baseUrlWithQuery = `${req.protocol}://${req.get("host")}${
      req.baseUrl
    }/${blogId}/comments?${queryParams.toString()}`;

    nextPage =
      skip + max_limit < totalCount
        ? `${baseUrlWithQuery}&page=${
            parseInt(page as string) + 1
          }&pageSize=${max_limit}`
        : null;
    previousPage =
      skip > 0
        ? `${baseUrlWithQuery}&page=${
            parseInt(page as string) - 1
          }&pageSize=${max_limit}`
        : null;
  }

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    count: totalCount,
    next: nextPage,
    previous: previousPage,
    results: comments,
  };

  return res.status(data.statusCode).json(data);
};

const validateCreateReply = (data: { commentId: string; content: string }) => {
  const schema = Joi.object({
    commentId: mongoIdValidator.objectId().trim().required(),
    content: Joi.string().trim().required(),
  });

  const { error, value: validatedData } = schema.validate(data);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  return validatedData;
};
export const createReply = async (req: Request, res: Response) => {
  logger.debug(`${req.method} Request on Route -> ${req.baseUrl}/`);

  // validate request body
  const { commentId, content } = validateCreateReply(req.body);
  const userId = (req.user as JwtPayload).id;

  // find parent comment by id
  const comment = await Comment.findById(commentId).select(
    "blogId blogAuthor "
  );
  if (!comment)
    throw new NotFoundError(`comment with id = ${commentId} does not exists.`);

  // create reply
  const { blogId, blogAuthor } = comment;
  let reply = new Comment({
    blogId,
    blogAuthor,
    content,
    commentedBy: userId,
    isReply: true,
    parent: commentId,
  });

  // save reply
  reply = await reply.save();

  // update parent comment and add reply as it's children
  await Comment.findByIdAndUpdate(commentId, { $push: { children: reply.id } });

  // update blog
  // - add comment in 'comments' array
  // - increment 'totalComments' count by 1
  const updatedBlog = await Blog.findByIdAndUpdate(
    blogId,
    {
      $inc: { "activity.totalComments": 1 },
    },
    { new: true }
  ).select("_id blogId author");

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.CREATED,
    result: {
      id: reply.id,
      parent: reply.parent,
      commentedBy: reply.commentedBy,
      content: reply.content,
      blog: {
        id: updatedBlog?._id,
        blogId: updatedBlog?.blogId,
        author: updatedBlog?.author,
      },
    },
  };

  return res.status(data.statusCode).json(data);
};
