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
  if (!isValidObjectId(blogId)) throw new BadRequestError("Invalid blog ID");

  const userId = (req.user as JwtPayload).id;

  // get blog
  const blog = await Blog.findById(blogId).select("_id").lean();
  if (!blog) throw new NotFoundError(`No blog found with blogId = ${blogId}`);

  const existingBookmark = await Bookmark.findOne({ userId, blogId })
    .select("_id")
    .lean();
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
  if (!isValidObjectId(blogId)) throw new BadRequestError("Invalid blog ID");

  const userId = (req.user as JwtPayload).id;

  const deletedBookmark = await Bookmark.findOneAndDelete({
    userId,
    blogId,
  })
    .select("_id")
    .lean();
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
      blogId: blogId,
      userId: userId,
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
  logger.debug(`${req.method} Request on Route -> ${req.baseUrl}/user`);

  const userId = (req.user as JwtPayload).id;

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
      path: "blog", // populate 'blogs' virtual field
      select:
        "-_id -content -likes -updatedAt -__v -activity -lastEditedAt -createdAt -isDraft",
      populate: {
        path: "authorDetails",
        select:
          "personalInfo.fullname personalInfo.username personalInfo.profileImage -_id",
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(maxLimit)
    .select("-__v -_id -createdAt -updatedAt")
    .lean();

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

export const checkIfBookmarked = async (req: Request, res: Response) => {
  // Check if the authenticated user has bookmarked the given blog
  logger.debug(
    `${req.method} Request on Route -> ${req.baseUrl}/user/blog/:blogId/exists`
  );

  // validate `blogId` request params
  const { blogId } = req.params;
  if (!isValidObjectId(blogId)) throw new BadRequestError("Invalid blog ID");

  const userId = (req.user as JwtPayload).id;
  const bookmarkExists = await Bookmark.exists({ userId, blogId });

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    result: {
      exists: Boolean(bookmarkExists),
    },
  };

  return res.status(data.statusCode).json(data);
};
