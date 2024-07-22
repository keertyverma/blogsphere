import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import { JwtPayload } from "jsonwebtoken";
import { isValidObjectId } from "mongoose";
import { Blog } from "../models/blog.model";
import { Bookmark } from "../models/bookmark.model";
import { APIResponse, APIStatus } from "../types/api-response";
import BadRequestError from "../utils/errors/bad-request";
import NotFoundError from "../utils/errors/not-found";
import { mongoIdValidator } from "../utils/joi-custom-types";
import logger from "../utils/logger";

export const addBookmark = async (req: Request, res: Response) => {
  logger.debug(`${req.method} Request on Route -> ${req.baseUrl}`);

  // validate 'blogId' request params
  const { blogId } = req.params;
  if (!isValidObjectId(blogId))
    throw new BadRequestError(`"blogId" must be a valid MongoDB ObjectId`);

  const userId = (req.user as JwtPayload).id;

  // get blog
  const blog = await Blog.findById(blogId);
  if (!blog) throw new NotFoundError(`No blog found with blogId = ${blogId}`);

  const existingBookmark = await Bookmark.findOne({ userId, blogId });
  if (existingBookmark) {
    throw new BadRequestError("Blog already bookmarked");
  }

  //   create bookmark
  const bookmark = new Bookmark({ userId, blogId });
  await bookmark.save();

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.CREATED,
    result: {
      _id: bookmark._id,
      blogId: bookmark.blogId,
      userId: bookmark.userId,
    },
  };

  return res.status(data.statusCode).json(data);
};

export const removeBookmark = async (req: Request, res: Response) => {
  logger.debug(`${req.method} Request on Route -> ${req.baseUrl}`);

  // validate 'blogId' request params
  const { blogId } = req.params;
  if (!isValidObjectId(blogId))
    throw new BadRequestError(`"blogId" must be a valid MongoDB ObjectId`);

  const userId = (req.user as JwtPayload).id;

  const deletedBookmark = await Bookmark.findOneAndDelete({ userId, blogId });
  if (!deletedBookmark) {
    throw new NotFoundError(
      "No bookmark found for the specified user and blog"
    );
  }

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    result: {
      _id: deletedBookmark._id,
      blogId: deletedBookmark.blogId,
      userId: deletedBookmark.userId,
    },
  };

  return res.status(data.statusCode).json(data);
};

const validateGetBookmarksQueryParams = (query: any) => {
  const schema = Joi.object({
    blogId: mongoIdValidator.objectId().trim(),
    page: Joi.number(),
    pageSize: Joi.number(),
  });

  const { error, value: validatedData } = schema.validate(query);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  return validatedData;
};

export const getBookmarksForUser = async (req: Request, res: Response) => {
  logger.debug(
    `${req.method} Request on Route -> ${req.baseUrl}/users/:userId`
  );

  // validate 'userId' request params
  const { userId } = req.params;
  if (!isValidObjectId(userId))
    throw new BadRequestError(`"userId" must be a valid MongoDB ObjectId`);

  // validate request query params
  const {
    blogId,
    page = 1,
    pageSize = 10,
  } = validateGetBookmarksQueryParams(req.query);

  const maxLimit = parseInt(pageSize);
  const skip = (parseInt(page as string) - 1) * maxLimit;
  const matchQuery = {
    userId,
    ...(blogId && { blogId }),
  };

  // Get total count of documents for pagination
  const totalCount = await Bookmark.countDocuments({
    ...matchQuery,
  });

  // find user bookmarked blogs
  const bookmarks = await Bookmark.find(matchQuery)
    .populate({
      path: "blogId",
      populate: {
        path: "author",
        select:
          "personalInfo.fullname personalInfo.username personalInfo.profileImage -_id",
      },
      select: "-_id -content -likes -updatedAt -__v",
    })
    .skip(skip)
    .limit(maxLimit)
    .select("-__v -_id -createdAt -updatedAt");

  // handle paginated response
  const queryParams = new URLSearchParams(req.query as any);
  queryParams.delete("page");
  queryParams.delete("pageSize");

  const baseUrlWithQuery = `${req.protocol}://${req.get("host")}${
    req.baseUrl
  }/users/${userId}?${queryParams.toString()}`;

  const nextPage =
    skip + maxLimit < totalCount
      ? `${baseUrlWithQuery}&page=${
          parseInt(page as string) + 1
        }&pageSize=${maxLimit}`
      : null;
  const previousPage =
    skip > 0
      ? `${baseUrlWithQuery}&page=${
          parseInt(page as string) - 1
        }&pageSize=${maxLimit}`
      : null;

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    count: totalCount,
    next: nextPage,
    previous: previousPage,
    results: bookmarks,
  };

  return res.status(data.statusCode).json(data);
};
