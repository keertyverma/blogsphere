import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import { JwtPayload } from "jsonwebtoken";
import { isValidObjectId } from "mongoose";
import { Blog } from "../models/blog.model";
import { Comment, IComment } from "../models/comment.model";
import { APIResponse, APIStatus } from "../types/api-response";
import BadRequestError from "../utils/errors/bad-request";
import CustomAPIError from "../utils/errors/custom-api";
import NotFoundError from "../utils/errors/not-found";
import { mongoIdValidator } from "../utils/joi-custom-types";
import logger from "../utils/logger";

const validateCreateComment = (data: { blogId: string; content: string }) => {
  const schema = Joi.object({
    blogId: mongoIdValidator.objectId().trim().required(),
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
  const { blogId, content } = validateCreateComment(req.body);
  const userId = (req.user as JwtPayload).id;

  // check if blog exists
  const blog = await Blog.findById(blogId).select("blogId author").lean();
  if (!blog) {
    throw new NotFoundError(`Blog with ID = ${blogId} not found.`);
  }

  // Create and save comment
  const comment = await Comment.create({
    blogId,
    blogAuthor: blog.author,
    content,
    commentedBy: userId,
  });

  // update blog - increment 'totalComments' and 'totalParentComments' count by 1
  const { modifiedCount } = await Blog.updateOne(
    { _id: blogId },
    {
      $inc: { "activity.totalComments": 1, "activity.totalParentComments": 1 },
    }
  );
  if (!modifiedCount) {
    throw new CustomAPIError(
      "Unable to update the blog's total comment count after creating the comment.",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.CREATED,
    result: {
      id: comment.id,
      blog: { id: blog._id, blogId: blog.blogId },
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
      .select("-__v")
      .populate(
        "commentedBy",
        "personalInfo.fullname personalInfo.username personalInfo.profileImage _id"
      )
      .sort({ commentedAt: -1 })
      .skip(skip)
      .limit(max_limit)
      .lean();

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

const _incrementalTotalReplies = async (commentId: string) => {
  const parentComment = await Comment.findByIdAndUpdate(commentId, {
    $inc: { totalReplies: 1 },
  })
    .select("parent")
    .lean();

  if (parentComment?.parent) {
    await _incrementalTotalReplies(parentComment.parent);
  }
};

export const createReply = async (req: Request, res: Response) => {
  logger.debug(`${req.method} Request on Route -> ${req.baseUrl}/`);

  // validate request body
  const { commentId, content } = validateCreateReply(req.body);
  const userId = (req.user as JwtPayload).id;

  // find parent comment by id
  const comment = await Comment.findById(commentId)
    .select("blogId blogAuthor")
    .lean();
  if (!comment)
    throw new NotFoundError(`Comment with ID = ${commentId} does not exists.`);
  const { blogId, blogAuthor } = comment;

  // create and save reply
  const reply = await Comment.create({
    blogId,
    blogAuthor,
    content,
    commentedBy: userId,
    isReply: true,
    parent: commentId,
  });

  // update `totalReplies` of all ancestor comments recursively
  await _incrementalTotalReplies(commentId);

  // update blog - increment 'totalComments' count by 1
  const existingBlog = await Blog.findByIdAndUpdate(blogId, {
    $inc: { "activity.totalComments": 1 },
  })
    .select("blogId")
    .lean();

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.CREATED,
    result: {
      id: reply.id,
      parent: reply.parent,
      commentedBy: reply.commentedBy,
      content: reply.content,
      blog: {
        id: existingBlog?._id,
        blogId: existingBlog?.blogId,
      },
    },
  };

  return res.status(data.statusCode).json(data);
};

const _decrementTotalReplies = async (
  commentId: string,
  decrementCount: number
) => {
  // recursively update 'totalReplies' count of given comment and it's all parent comments
  const parentComment = await Comment.findByIdAndUpdate(commentId, {
    $inc: { totalReplies: decrementCount },
  })
    .select("parent")
    .lean();

  if (parentComment?.parent) {
    await _decrementTotalReplies(parentComment.parent, decrementCount);
  }
};

export const deleteCommentById = async (req: Request, res: Response) => {
  logger.debug(`${req.method} Request on Route -> ${req.baseUrl}/:id`);

  const { id } = req.params;
  // check id format
  if (!isValidObjectId(id)) throw new BadRequestError("Invalid comment ID");

  // find comment
  const comment = await Comment.findById(id)
    .select(
      "_id commentedBy blogId blogAuthor content isReply parent totalReplies"
    )
    .lean();
  if (!comment) throw new NotFoundError(`Comment with ID = ${id} not found.`);

  // check user permission - comment can only be deleted by comment creator or blog author
  const userId = (req.user as JwtPayload).id;
  if (
    String(userId) !== String(comment.commentedBy) &&
    String(userId) !== String(comment.blogAuthor)
  )
    throw new CustomAPIError(
      "Unauthorized to delete this comment.",
      StatusCodes.FORBIDDEN
    );

  // delete comment
  const { deletedCount } = await Comment.deleteOne({ _id: id });
  if (!deletedCount) {
    throw new CustomAPIError(
      `There was an issue with deleting comment = ${id}.`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  const isReply = comment?.isReply && comment.parent;
  const decrementBy = -(1 + comment.totalReplies);
  if (isReply) {
    // If the comment is a reply, recursively update the totalReplies count for all ancestor comments
    await _decrementTotalReplies(comment?.parent as string, decrementBy);
  }

  // update blog - decrement 'totalComments' and 'totalParentComments'
  const existingBlog = await Blog.findByIdAndUpdate(comment?.blogId, {
    $inc: {
      "activity.totalComments": decrementBy,
      "activity.totalParentComments": isReply ? 0 : -1,
    },
  })
    .select("_id blogId")
    .lean();

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    result: {
      id: comment._id,
      parent: comment.parent,
      commentedBy: comment.commentedBy,
      content: comment.content,
      blog: {
        id: existingBlog?._id,
        blogId: existingBlog?.blogId,
      },
    },
  };

  return res.status(data.statusCode).json(data);
};

const validateUpdateComment = (data: { content: string }) => {
  const schema = Joi.object({
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

export const updateCommentById = async (req: Request, res: Response) => {
  logger.debug(`${req.method} Request on Route -> ${req.baseUrl}/:id`);

  // check id format
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new BadRequestError("Invalid comment ID");

  // find comment
  const comment = await Comment.findById(id).select("commentedBy").lean();
  if (!comment) throw new NotFoundError(`Comment with ID = ${id} not found.`);

  // check user permission - comment can only be updated by it's creator
  const userId = (req.user as JwtPayload).id;
  if (String(userId) !== String(comment.commentedBy))
    throw new CustomAPIError(
      "Unauthorized to update this comment.",
      StatusCodes.FORBIDDEN
    );

  // validate request body data
  const { content: updatedContent } = validateUpdateComment(req.body);

  // update comment and set 'isEdited' flag
  const updatedComment = await Comment.findByIdAndUpdate(
    id,
    {
      $set: { content: updatedContent, isEdited: true },
    },
    { new: true, lean: true }
  );

  if (!updatedComment) {
    throw new CustomAPIError(
      `There was an issue updating comment = ${id}.`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    result: {
      id: updatedComment._id,
      parent: updatedComment.parent,
      commentedBy: updatedComment.commentedBy,
      content: updatedComment.content,
      blog: {
        id: updatedComment.blogId,
      },
      isEdited: updatedComment.isEdited,
    },
  };

  return res.status(data.statusCode).json(data);
};
