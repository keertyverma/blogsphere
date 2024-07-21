import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { isValidObjectId } from "mongoose";
import { Blog } from "../models/blog.model";
import { Bookmark } from "../models/bookmark.model";
import { APIResponse, APIStatus } from "../types/api-response";
import BadRequestError from "../utils/errors/bad-request";
import NotFoundError from "../utils/errors/not-found";
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
