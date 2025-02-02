import escapeStringRegexp from "escape-string-regexp";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { nanoid } from "nanoid";

import { Blog } from "../models/blog.model";
import { Bookmark } from "../models/bookmark.model";
import { Comment } from "../models/comment.model";
import { User } from "../models/user.model";
import { SortQuery } from "../types";
import {
  APIResponse,
  APIStatus,
  CursorPaginatedAPIResponse,
} from "../types/api-response";
import { isValidCursor } from "../utils";
import BadRequestError from "../utils/errors/bad-request";
import CustomAPIError from "../utils/errors/custom-api";
import NotFoundError from "../utils/errors/not-found";
import { mongoIdValidator } from "../utils/joi-custom-types";
import logger from "../utils/logger";

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
  logger.debug(`${req.method} Request on Route -> ${req.baseUrl}`);

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
    isDraft,
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

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.CREATED,
    result: {
      id: blog.blogId,
    },
  };

  return res.status(data.statusCode).json(data);
};

const validateBlogQueryParams = (query: any) => {
  const schema = Joi.object({
    tag: Joi.string(),
    search: Joi.string(),
    ordering: Joi.string(),
    authorId: mongoIdValidator.objectId(),
    nextCursor: Joi.string()
      .optional()
      .custom((value, helper) => {
        if (!isValidCursor(value)) {
          return helper.error("any.invalid");
        }
        return value;
      }, "Cursor Validation"),
    limit: Joi.number(),
  });

  const { error } = schema.validate(query);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }
};

const getAllPublishedBlogs = async (req: Request, res: Response) => {
  logger.debug(`${req.method} Request on Route -> ${req.baseUrl}`);

  // validate request query params
  validateBlogQueryParams(req.query);

  const {
    tag,
    authorId,
    search,
    ordering,
    nextCursor = "",
    limit = 10,
  } = req.query;

  // Ensure the provided `limit` does not exceed the maximum allowed limit
  const maxLimit = 50;
  const finalLimit = Math.min(parseInt(limit as string), maxLimit);

  const matchQuery: any = {
    isDraft: false,
    ...(authorId && { author: new Types.ObjectId(authorId as string) }),
    ...(tag && { tags: (tag as string).toLowerCase() }),
  };

  // Query for cursor based pagination
  // Fetch documents older than the cursor's timestamp, or with the same timestamp but a smaller ID.
  //    1. Fetch documents where `createdAt` timestamp is less than the cursor's timestamp.
  //    2. If timestamps are equal, use `_id` to break ties and fetch documents with a smaller `_id`.
  let cursorQuery = {};
  if (nextCursor) {
    const [createdAt, id] = (nextCursor as string).split("_");
    cursorQuery = {
      $or: [
        { createdAt: { $lt: new Date(createdAt) } },
        {
          createdAt: new Date(createdAt),
          _id: { $lt: new Types.ObjectId(id) },
        },
      ],
    };
  }

  // Escape the search string to ensure it's safely used in a regular expression, preventing any special characters from causing errors
  const safeSearchString = search ? escapeStringRegexp(search as string) : null;
  const regexQuery = { $regex: `${safeSearchString}`, $options: "i" };
  const searchQuery: any = safeSearchString
    ? {
        $or: [
          { title: regexQuery },
          { description: regexQuery },
          // Include fullname match only when 'authorId' is not provided
          ...(!authorId
            ? [
                {
                  "authorDetails.personalInfo.fullname": regexQuery,
                },
              ]
            : []),
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
      : { createdAt: -1, _id: -1 };

  // Fetch blogs using cursor based pagination
  const blogs = await Blog.aggregate([
    {
      $match: { ...matchQuery, ...cursorQuery },
    },
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "authorDetails", // The joined data will be an array
      },
    },
    {
      $unwind: "$authorDetails", // Flatten the array or extract the first element
    },
    {
      $match: searchQuery,
    },
    {
      $sort: sortQuery,
    },
    {
      $limit: finalLimit + 1, // Fetch one extra to determine `nextCursor`
    },
    {
      $project: {
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

  // Determine the `nextCursor` for pagination
  // - Fetching `limit + 1` documents ensures there is more data beyond the current page.
  // - If more results exist, `nextCursor` is generated using the `createdAt` timestamp and `_id` of the last document.
  // - `nextCursor` acts as a boundary for fetching the next page while maintaining stable ordering,
  //    ensuring that records are neither skipped nor duplicated between pages when data is updated.
  let cursor = null;
  if (blogs.length > finalLimit) {
    blogs.pop(); // Remove extra item
    const lastBlog = blogs[blogs.length - 1]; // get last item from current page
    cursor = `${lastBlog.createdAt.toISOString()}_${lastBlog._id}`;
  }

  const data: CursorPaginatedAPIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    nextCursor: cursor,
    results: blogs,
  };

  return res.status(data.statusCode).json(data);
};

const getPublishedBlogById = async (req: Request, res: Response) => {
  logger.debug(`${req.method} Request on Route -> ${req.baseUrl}/:blogId`);

  const { blogId } = req.params;
  const blog = await Blog.findOne({ blogId, isDraft: false })
    .populate({
      path: "authorDetails", //use the virtual 'authorDetails' to populates
      select:
        "_id personalInfo.fullname personalInfo.username personalInfo.profileImage",
    })
    .select(
      "blogId title description content coverImgURL author tags activity createdAt likes isDraft _id"
    )
    .lean();

  if (!blog) throw new NotFoundError(`No blog found with blogId = ${blogId}`);

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    result: blog,
  };

  return res.status(data.statusCode).json(data);
};

const updateReadCount = async (req: Request, res: Response) => {
  logger.debug(
    `${req.method} Request on Route -> ${req.baseUrl}/:blogId/readCount`
  );

  const { blogId } = req.params;

  // Increment total read count of blog by 1
  const blog = await Blog.findOneAndUpdate(
    { blogId },
    { $inc: { "activity.totalReads": 1 } },
    { new: true }
  )
    .populate({
      path: "authorDetails", //use the virtual 'authorDetails' to populates
      select:
        "personalInfo.fullname personalInfo.username personalInfo.profileImage -_id",
    })
    .select("blogId title author activity createdAt -_id")
    .lean();

  if (!blog) throw new NotFoundError(`No blog found with blogId = ${blogId}`);

  // Increment total read count of user by 1
  const user = await User.findOneAndUpdate(
    { _id: blog.author },
    { $inc: { "accountInfo.totalReads": 1 } },
    { new: true }
  );

  if (!user) throw new Error("User not found. Unable to update read counts");

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    result: {
      blogId: blog.blogId,
      title: blog.title,
      author: blog.author,
      activity: blog.activity,
    },
  };

  return res.status(data.statusCode).json(data);
};

const updateBlogById = async (req: Request, res: Response) => {
  logger.debug(`${req.method} Request on Route -> ${req.baseUrl}/:blogId`);

  // get blog by blogId
  const { blogId } = req.params;
  const blog = await Blog.findOne({ blogId }).lean();
  if (!blog) throw new NotFoundError(`No blog found with blogId = ${blogId}`);

  const isDraft = Boolean(req.body.isDraft);
  // validate request body
  validateCreateBlog(req.body, isDraft);

  let { tags } = req.body;
  tags = tags?.map((tag: string) => tag.toLowerCase());

  // update Blog
  const updatedBlog = await Blog.findOneAndUpdate(
    { blogId },
    { ...req.body, tags },
    {
      new: true,
    }
  )
    .populate({
      path: "authorDetails", //use the virtual 'authorDetails' to populates
      select:
        "personalInfo.fullname personalInfo.username personalInfo.profileImage",
    })
    .select(
      "blogId title description content author coverImgURL tags activity createdAt isDraft -_id"
    )
    .lean();

  // increment user total post count if draft blog is getting published
  if (blog.isDraft && !isDraft) {
    const user = await User.findOneAndUpdate(
      { _id: blog.author },
      {
        $inc: { "accountInfo.totalPosts": 1 },
      }
    );

    if (!user)
      throw new CustomAPIError(
        "Failed to update total posts count",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
  }

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    result: updatedBlog,
  };

  return res.status(data.statusCode).json(data);
};

const updateLike = async (req: Request, res: Response) => {
  logger.debug(`${req.method} Request on Route -> ${req.baseUrl}/:blogId/like`);

  const userId = (req.user as JwtPayload).id;
  const { blogId } = req.params;

  // get blog
  const blog = await Blog.findOne({ blogId }).select("likes");
  if (!blog) throw new NotFoundError(`No blog found with blogId = ${blogId}`);

  const isLiked = blog.likes.get(userId);
  if (isLiked) {
    // unlike blog
    blog.likes.delete(userId);
  } else {
    // like blog
    blog.likes.set(userId, true);
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    blog.id,
    {
      likes: blog.likes,
      $inc: { "activity.totalLikes": isLiked ? -1 : 1 },
    },
    { new: true }
  ).select("blogId title activity author -_id");

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    result: updatedBlog,
  };

  return res.status(data.statusCode).json(data);
};

const deleteBlogByBlogId = async (req: Request, res: Response) => {
  logger.debug(`${req.method} Request on Route -> ${req.baseUrl}/:blogId`);

  const { blogId } = req.params;

  // delete blog
  const deletedBlog = await Blog.findOneAndDelete({ blogId })
    .populate({
      path: "authorDetails", //use the virtual 'authorDetails' to populates
      select:
        "personalInfo.fullname personalInfo.username personalInfo.profileImage",
    })
    .select("blogId title isDraft author")
    .lean();

  if (!deletedBlog)
    throw new NotFoundError(`No blog found with blogId = ${blogId}`);

  const { _id: id, author, isDraft } = deletedBlog;
  // update author
  // - remove blog from author blogs list
  // - decrement total post count if published blog is deleted
  const user = await User.findByIdAndUpdate(author, {
    $inc: { "accountInfo.totalPosts": isDraft ? 0 : -1 },
    $pull: {
      blogs: id,
    },
  });
  if (!user)
    throw new CustomAPIError(
      "Failed to update user blogs and total posts count",
      StatusCodes.INTERNAL_SERVER_ERROR
    );

  // delete all comments and replies associated with this blog
  await Comment.deleteMany({ blogId: id });

  // delete all bookmarks associated with this blog
  await Bookmark.deleteMany({ blogId: id });

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    result: deletedBlog,
  };

  return res.status(data.statusCode).json(data);
};

const _validateDraftBlogsQueryParams = (query: any) => {
  const schema = Joi.object({
    search: Joi.string().trim(),
    page: Joi.number(),
    pageSize: Joi.number(),
  });

  return schema.validate(query);
};

const getAllDraftBlogs = async (req: Request, res: Response) => {
  logger.debug(`${req.method} Request on Route -> ${req.baseUrl}/drafts`);

  // validate request query params
  const { error, value: validatedReqQuery } = _validateDraftBlogsQueryParams(
    req.query
  );
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  const { id: authorId } = req.user as JwtPayload;
  const { search = "", page = 1, pageSize = 10 } = validatedReqQuery;

  // for pagination
  const maxLimit = parseInt(pageSize as string);
  const skip = (parseInt(page as string) - 1) * maxLimit;

  const matchQuery = {
    author: new Types.ObjectId(authorId as string),
    isDraft: true,
  };

  // Escape the search string to ensure it's safely used in a regular expression, preventing any special characters from causing errors
  const safeSearchString = search ? escapeStringRegexp(search) : "";
  const regexQuery = { $regex: `${safeSearchString}`, $options: "i" };
  const searchQuery = safeSearchString
    ? {
        $or: [{ title: regexQuery }, { description: regexQuery }],
      }
    : {};

  // Get total count of documents for pagination
  const totalCount = await Blog.countDocuments({
    ...matchQuery,
    ...searchQuery,
  });

  const blogs = await Blog.find({
    ...matchQuery,
    ...searchQuery,
  })
    .select(
      "blogId title description author coverImgURL tags activity createdAt -_id"
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(maxLimit)
    .populate({
      path: "authorDetails", //use the virtual 'authorDetails' to populates
      select:
        "-_id personalInfo.fullname personalInfo.username personalInfo.profileImage",
    })
    .lean();

  const queryParams = new URLSearchParams(req.query as any);
  queryParams.delete("page");
  queryParams.delete("pageSize");

  const baseUrlWithQuery = `${req.protocol}://${req.get("host")}${
    req.baseUrl
  }/drafts?${queryParams.toString()}`;

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
    results: blogs,
  };

  return res.status(data.statusCode).json(data);
};

const getDraftBlogById = async (req: Request, res: Response) => {
  logger.debug(
    `${req.method} Request on Route -> ${req.baseUrl}/drafts/:blogId`
  );

  const { id: userId } = req.user as JwtPayload;
  const { blogId } = req.params;

  // fetch the draft blog
  const draftBlog = await Blog.findOne({ blogId, isDraft: true })
    .select(
      "_id blogId title description content coverImgURL author tags createdAt"
    )
    .lean();

  if (!draftBlog)
    throw new NotFoundError(`No blog found with blogId = ${blogId}`);

  // Ensure that only the blog author can access the draft blog
  if (draftBlog.author.toString() !== userId) {
    throw new CustomAPIError(
      "This draft blog can only be accessed by its author.",
      StatusCodes.FORBIDDEN
    );
  }

  const data: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    result: draftBlog,
  };

  return res.status(data.statusCode).json(data);
};

export {
  createBlog,
  deleteBlogByBlogId,
  getAllDraftBlogs,
  getAllPublishedBlogs,
  getDraftBlogById,
  getPublishedBlogById,
  updateBlogById,
  updateLike,
  updateReadCount,
};
