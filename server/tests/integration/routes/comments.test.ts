import "dotenv/config";
import { Server } from "http";
import mongoose, { disconnect } from "mongoose";
import request from "supertest";
import { Application } from "express";

import { startServer } from "../../../src/start";
import { Blog, IBlog } from "../../../src/models/blog.model";
import { Comment, IComment } from "../../../src/models/comment.model";
import { IUser, User } from "../../../src/models/user.model";

let server: Server;
let app: Application; // Express instance
let endpoint: string = `/api/v1/comments`;

const createUsers = async () => {
  const user1 = {
    personalInfo: {
      fullname: "Mickey Mouse",
      password: "Clubhouse12",
      email: "mickey@test.com",
      username: "mickey",
      profileImage: "http://example-img.png",
    },
  };
  const user2 = {
    personalInfo: {
      fullname: "Donald Duck",
      password: "Clubhouse123",
      email: "donald@test.com",
      username: "donald",
      profileImage: "http://example-img.png",
    },
  };
  const user3 = {
    personalInfo: {
      fullname: "Minnie Mouse",
      password: "Clubhouse123",
      email: "minnie@test.com",
      username: "minnie",
      profileImage: "http://example-img.png",
    },
  };

  const users = await User.create([user1, user2, user3]);
  return users;
};

const createBlogs = async (userId: string) => {
  // published blogs
  const publishedBlog1 = {
    isDraft: false,
    blogId: "how-to-setup-zustand-with-react-app-oki178bfopl",
    title: "How to setup zustand ! with react app @ok ",
    description: "some short description",
    coverImgURL: "https://sample.jpg",
    author: userId,
    content: {
      blocks: [
        {
          id: "O8uS0t2SUk",
          type: "header",
          data: {
            text: "this is how it is done",
            level: 2,
          },
        },
        {
          id: "s-VOjHF8Kk",
          type: "list",
          data: {
            style: "ordered",
            items: ["step-1", "step-2", "step-3"],
          },
        },
      ],
    },
    tags: ["tag1", "tag2", "tag3"],
    activity: {
      totalLikes: 1,
      totalReads: 2,
    },
  };
  const publishedBlog2 = {
    isDraft: false,
    blogId: "water-color-technique-oki178bfopl",
    title: "Water color technique ",
    description: "some short description",
    author: userId,
    content: {
      blocks: [
        {
          id: "O8uS0t2SUk",
          type: "header",
          data: {
            text: "this is how it is done",
            level: 2,
          },
        },
      ],
    },
    tags: ["art", "tag2"],
    activity: {
      totalLikes: 5,
      totalReads: 5,
    },
  };

  const blogs = await Blog.create([publishedBlog1, publishedBlog2]);
  return blogs;
};

const createComments = async (
  blogId: string,
  blogAuthor: string,
  userId: string
) => {
  const comments = await Comment.create([
    {
      blogId,
      blogAuthor,
      commentedBy: userId,
      content: "Comment 1",
    },
    {
      blogId,
      blogAuthor,
      commentedBy: userId,
      content: "Comment 2",
    },
    {
      blogId,
      blogAuthor,
      commentedBy: userId,
      content: "Comment 3",
    },
    {
      blogId,
      blogAuthor,
      commentedBy: userId,
      content: "Comment 4",
    },
  ]);

  return comments;
};

describe("/api/v1/blogs", () => {
  beforeAll(async () => {
    try {
      ({ server, app } = await startServer());
    } catch (error) {
      console.error("🚨 Server startup failed in tests:", error);
      throw new Error("Failed to start the test server");
    }
  });

  afterAll(async () => {
    if (server) server.close();
    await disconnect();
  });

  describe("POST /", () => {
    let blogs: IBlog[];
    let users: IUser[];
    let blogAuthor: string;
    let commentedByUser: any;

    beforeAll(async () => {
      if (!server) return;
      users = await createUsers();
      blogAuthor = users[0].id;
      commentedByUser = users[1];
      blogs = await createBlogs(blogAuthor);
    });

    afterAll(async () => {
      if (!server) return;
      // db cleanup
      await User.deleteMany({});
      await Blog.deleteMany({});
      await Comment.deleteMany({});
    });

    let token: string;
    const exec = async (payload: any) => {
      return await request(app)
        .post(endpoint)
        .set("Cookie", `authToken=${token}`)
        .send(payload);
    };

    it("should return UnAuthorized-401 if user is not authorized", async () => {
      // token cookie is not set
      token = "";
      const blogId = new mongoose.Types.ObjectId().toString();

      const res = await exec({ blogId, content: "some thoughtful comment" });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toMatchObject({
        code: "UNAUTHORIZED",
        message: "Unauthorized access.",
        details: "Access Denied.Token is not provided.",
      });
    });

    it("should return BadRequest-400 if token is invalid", async () => {
      token = "invalid token";
      const blogId = new mongoose.Types.ObjectId().toString();

      const res = await exec({ blogId, content: "some thoughtful comment" });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Invalid auth token.",
      });
    });

    it("should return BadRequest-400 if blogId parameter is not of the correct type", async () => {
      token = commentedByUser.generateAuthToken();
      // 'blogId' must be a valid mongodb Object id
      const blogId = "invalid-blogid";

      const res = await exec({
        blogId,
        content: "some thoughtful comment",
        blogAuthor: blogAuthor,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"blogId" must be a valid MongoDB ObjectId',
      });
    });

    it("should return NotFound-404 if blog with given blogId does not exists", async () => {
      token = commentedByUser.generateAuthToken();
      // blog with this id does not exists
      const blogId = new mongoose.Types.ObjectId().toString();

      const res = await exec({
        blogId,
        content: "some thoughtful comment",
        blogAuthor: blogAuthor,
      });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `Blog with id = ${blogId} not found.`,
      });
    });

    it("should create comment and update blog's comment", async () => {
      token = commentedByUser.generateAuthToken();
      const blogId = blogs[0].id;
      const commentData = {
        blogId,
        content: "some thoughtful comment",
        blogAuthor: blogAuthor,
      };

      const res = await exec(commentData);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");

      const { id, blog, commentedBy, content } = res.body.result;
      expect(id).toBeDefined();
      expect(blog.id).toBe(blogId);
      expect(blog.author).toBe(commentData.blogAuthor);
      expect(content).toBe(commentData.content);
      expect(commentedBy).toBe(commentedByUser.id);

      // check blog - 'totalComments' and 'totalParentComments' is increment by 1
      const updatedBlog = await Blog.findById(blogId);
      expect(updatedBlog?.activity.totalComments).toBe(1);
      expect(updatedBlog?.activity.totalParentComments).toBe(1);
    });
  });

  describe(`GET /`, () => {
    let blogs: IBlog[];
    let comments: IComment[];

    beforeAll(async () => {
      if (!server) return;
      const users = await createUsers();
      const blogAuthor = users[0].id;
      blogs = await createBlogs(blogAuthor);

      const commentedByUser = users[1];
      comments = await createComments(
        blogs[0].id,
        blogAuthor,
        commentedByUser.id
      );
    });

    afterAll(async () => {
      if (!server) return;
      // db cleanup
      await User.deleteMany({});
      await Blog.deleteMany({});
      await Comment.deleteMany({});
    });

    it("should return BadRequest-400 if blogId parameter is invalid", async () => {
      // 'blogId' must be a valid mongodb Object id
      const blogId = "invalid-blogid";

      const res = await request(app).get(`${endpoint}?blogId=${blogId}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"blogId" must be a valid MongoDB ObjectId',
      });
    });

    it("should return BadRequest-400 if other query parameter is invalid", async () => {
      // page parameter must be a number
      const page = "two";
      const blogId = new mongoose.Types.ObjectId().toString();

      const res = await request(app).get(
        `${endpoint}?blogId=${blogId}&page=${page}`
      );

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"page" must be a number',
      });
    });

    it("should get all comments from first page", async () => {
      const blogId = blogs[0].id;
      const pageSize = comments.length;

      const res = await request(app).get(
        `${endpoint}?blogId=${blogId}&pageSize=${pageSize}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      const { count, previous, next, results } = res.body;
      expect(count).toBe(comments.length);
      expect(previous).toBeNull();
      expect(next).toBeNull();
      expect(results).toHaveLength(pageSize);
    });

    it("should get all comments from second page", async () => {
      const blogId = blogs[0].id;
      const page = 2;
      const pageSize = comments.length / 2;

      const res = await request(app).get(
        `${endpoint}?blogId=${blogId}&page=${page}&pageSize=${pageSize}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      const { count, previous, next, results } = res.body;
      expect(count).toBe(comments.length);
      expect(previous).toMatch(/&page=1/i);
      expect(next).toBeNull();
      expect(results).toHaveLength(pageSize);
    });
  });

  describe("POST /replies", () => {
    let blogs: IBlog[];
    let comments: IComment[];
    let repliedByUser: any;

    beforeAll(async () => {
      if (!server) return;
      const users = await createUsers();
      const blogAuthor = users[0].id;
      repliedByUser = users[0];
      blogs = await createBlogs(blogAuthor);

      const commentedByUser = users[1];
      comments = await createComments(
        blogs[0].id,
        blogAuthor,
        commentedByUser.id
      );
    });

    afterAll(async () => {
      if (!server) return;
      // db cleanup
      await User.deleteMany({});
      await Blog.deleteMany({});
      await Comment.deleteMany({});
    });

    let token: string;
    const exec = async (payload: any) => {
      return await request(app)
        .post(`${endpoint}/replies`)
        .set("Cookie", `authToken=${token}`)
        .send(payload);
    };

    it("should return UnAuthorized-401 if user is not authorized", async () => {
      // token cookie is not set
      token = "";
      const payload = { content: "some thoughtful reply to existing comment" };

      const res = await exec(payload);

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toMatchObject({
        code: "UNAUTHORIZED",
        message: "Unauthorized access.",
        details: "Access Denied.Token is not provided.",
      });
    });

    it("should return BadRequest-400 if token is invalid", async () => {
      token = "invalid token";
      const payload = { content: "some thoughtful reply to existing comment" };

      const res = await exec({ payload });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Invalid auth token.",
      });
    });

    it("should return BadRequest-400 if commentId parameter is not a valid value", async () => {
      token = repliedByUser.generateAuthToken();
      // 'commentId' must be a valid mongodb Object id
      const commentId = "invalid-commentId";

      const res = await exec({
        commentId,
        content: "some thoughtful comment",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"commentId" must be a valid MongoDB ObjectId',
      });
    });

    it("should return NotFound-404 if parent comment does not exists", async () => {
      token = repliedByUser.generateAuthToken();
      // comment with this id does not exists
      const commentId = new mongoose.Types.ObjectId().toString();

      const res = await exec({
        commentId,
        content: "some thoughtful reply to existing comment",
      });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `comment with id = ${commentId} does not exists.`,
      });
    });

    it("should create reply and update comment and blog accordingly", async () => {
      token = repliedByUser.generateAuthToken();
      const comment = comments.filter((c) => c.isReply === false)[0];
      const blog = await Blog.findById(comment.blogId);
      const totalComment = blog?.activity.totalComments;
      const totalParentComments = blog?.activity.totalParentComments;
      const replyData = {
        commentId: comment.id,
        content: "some thoughtful reply to existing comment",
      };

      const res = await exec(replyData);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");
      const {
        id,
        parent,
        commentedBy,
        content,
        blog: { id: blogId },
      } = res.body.result;
      expect(id).toBeDefined();
      expect(parent).toBe(replyData.commentId);
      expect(content).toBe(replyData.content);
      expect(commentedBy).toBe(repliedByUser.id);

      const parentComment = await Comment.findById(comment.id);
      expect(parentComment?.totalReplies).toBe(1);

      // check blog - 'totalComments' is increment by 1 and `totalParentComments` must be the same count as before.
      const updatedBlog = await Blog.findById(blogId);
      expect(updatedBlog?.activity.totalComments).toBe(
        (totalComment as number) + 1
      );
      expect(updatedBlog?.activity.totalParentComments).toBe(
        totalParentComments
      );
    });

    it("should update totalReplies count for all ancestor comment for a given reply", async () => {
      // create comment
      const comment: IComment = comments.filter((c) => c.isReply === false)[0];
      const user1 = comment.commentedBy;

      // create reply to above comment
      const reply = await Comment.create({
        blogId: comment.blogId,
        blogAuthor: comment.blogAuthor,
        commentedBy: repliedByUser,
        content: `Reply to ${comment.content}`,
        isReply: true,
        parent: comment.id,
      });
      comment.totalReplies = 1;
      await comment.save();

      // create reply by calling api
      const repliedBy = await User.findById(user1);
      token = repliedBy?.generateAuthToken() as string;
      const replyData = {
        commentId: reply.id,
        content: `Reply to ${reply.content}`,
      };

      const res = await exec(replyData);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");

      const { id, parent, commentedBy, content } = res.body.result;
      expect(id).toBeDefined();
      expect(parent).toBe(replyData.commentId);
      expect(content).toBe(replyData.content);
      expect(commentedBy).toBe(repliedBy?.id);

      const parentComment = await Comment.findById(reply.id);
      expect(parentComment?.totalReplies).toBe(1);

      const greatParentComment = await Comment.findById(comment.id);
      expect(greatParentComment?.totalReplies).toBe(2);
    });
  });

  describe("DELETE /:id", () => {
    let blogs: IBlog[];
    let users: IUser[];
    let blogAuthor: string;
    let comments: IComment[];
    let repliedByUser: any;
    let commentedByUser: any;

    beforeAll(async () => {
      if (!server) return;
      users = await createUsers();
      blogAuthor = users[0].id;
      blogs = await createBlogs(blogAuthor);
      repliedByUser = users[0];
      commentedByUser = users[1];
    });

    beforeEach(async () => {
      if (!server) return;
      comments = await createComments(
        blogs[0].id,
        blogAuthor,
        commentedByUser.id
      );
    });

    afterEach(async () => {
      if (!server) return;
      await Comment.deleteMany({});
    });

    afterAll(async () => {
      if (!server) return;
      // db cleanup
      await User.deleteMany({});
      await Blog.deleteMany({});
    });

    let token: string;
    const exec = async (id: any) => {
      return await request(app)
        .delete(`${endpoint}/${id}`)
        .set("Cookie", `authToken=${token}`);
    };

    it("should return UnAuthorized-401 if user is not authorized", async () => {
      // token cookie is not set
      token = "";
      const commentId = new mongoose.Types.ObjectId().toString();

      const res = await exec(commentId);

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toMatchObject({
        code: "UNAUTHORIZED",
        message: "Unauthorized access.",
        details: "Access Denied.Token is not provided.",
      });
    });

    it("should return BadRequest-400 if commentId is invalid", async () => {
      token = commentedByUser.generateAuthToken();
      // 'commentId' must be a valid mongodb Object id
      const commentId = "invalid-blogid";

      const res = await exec(commentId);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"Id" must be a valid MongoDB ObjectId',
      });
    });

    it("should return NotFound-404 if comment does not exists", async () => {
      token = commentedByUser.generateAuthToken();
      // comment with this id does not exists
      const commentId = new mongoose.Types.ObjectId().toString();

      const res = await exec(commentId);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `Comment with id = ${commentId} not found.`,
      });
    });

    it("should return Forbidden-403 if user is not allowed to perform delete operation", async () => {
      const comment = comments.filter((c) => c.isReply === false)[0];
      // this user is not neither comment creator nor blog author
      const user: any = users.filter(
        (u) =>
          String(u._id) !== String(comment.commentedBy) &&
          String(u._id) !== String(comment.blogAuthor)
      )[0];
      token = user.generateAuthToken();

      const res = await exec(comment.id);

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toMatchObject({
        code: "FORBIDDEN",
        message: "You do not have permission to access this resource.",
        details: "You can not delete this comment",
      });
    });

    it("should delete a top level comment that has no replies", async () => {
      // if we delete a top level comment that has no replies
      // 1. comment must be deleted
      // 2. blog `totalParentComments` must be decrement by 1
      //    blog `totalComments` must be decrement by 1

      token = commentedByUser.generateAuthToken();
      // get top level comment
      const comment = comments.filter((c) => !c.parent)[0];
      // add totalComments and totalParentComments on blog
      const blog = await Blog.findByIdAndUpdate(
        { _id: comment.blogId },
        {
          $inc: {
            "activity.totalComments": 1,
            "activity.totalParentComments": 1,
          },
        },
        { new: true }
      );

      const res = await exec(comment.id);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      const {
        id,
        blog: { id: blogId },
      } = res.body.result;
      expect(id).toBe(comment.id);

      // check blog - 'totalParentComments' and 'totalComments' is decrement by 1
      const updatedBlog = await Blog.findById(blogId);
      expect(updatedBlog?.activity.totalParentComments).toBe(
        (blog?.activity.totalParentComments as number) - 1
      );
      expect(updatedBlog?.activity.totalComments).toBe(
        (blog?.activity.totalComments as number) - 1
      );
    });

    it("should delete a top level comment that has replies", async () => {
      // if we delete top level comment which has replies then
      // 1. comment must be deleted
      // 2. blog `totalParentComments` must be decrement by 1
      //    blog `totalComments` must be decrement by 1 + (totalReplies count of deleted comment)

      token = commentedByUser.generateAuthToken();
      // get top level comment
      const comment = comments.filter((c) => !c.parent)[0];

      // create reply to above comment
      const reply = await Comment.create({
        blogId: comment.blogId,
        blogAuthor: comment.blogAuthor,
        commentedBy: repliedByUser,
        content: `Reply to ${comment.content}`,
        isReply: true,
        parent: comment.id,
      });
      comment.totalReplies = 1;
      await comment.save();

      // add totalComments and totalParentComments on blog
      const blog = await Blog.findByIdAndUpdate(
        { _id: comment.blogId },
        {
          $inc: {
            "activity.totalComments": 2,
            "activity.totalParentComments": 1,
          },
        },
        { new: true }
      );

      const res = await exec(comment.id);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      const {
        id,
        blog: { id: blogId },
      } = res.body.result;
      expect(id).toBe(comment.id);

      // check blog - 'totalParentComments' is decrement by 1 and 'totalComments' is decremented by 2
      const updatedBlog = await Blog.findById(blogId);
      expect(updatedBlog?.activity.totalParentComments).toBe(
        (blog?.activity.totalParentComments as number) - 1
      );
      expect(updatedBlog?.activity.totalComments).toBe(
        (blog?.activity.totalComments as number) - (1 + comment.totalReplies)
      );
    });

    it("should delete a reply that has no replies", async () => {
      // if we delete a reply which has not nested replies then
      // 1. reply must be deleted
      // 2. Its all ancestor comments `totalReplies` must be decrement by 1 recursively
      // 3. blog `totalParentComments` must not be changed
      //    blog `totalComments` must be decrement by 1

      // create comment
      const comment: IComment = comments.filter((c) => c.isReply === false)[0];
      // create reply to above comment
      const reply = await Comment.create({
        blogId: comment.blogId,
        blogAuthor: comment.blogAuthor,
        commentedBy: repliedByUser,
        content: `Reply to ${comment.content}`,
        isReply: true,
        parent: comment.id,
      });
      comment.totalReplies = 1;
      await comment.save();
      // add totalComments and totalParentComments on blog
      const blog = await Blog.findByIdAndUpdate(
        { _id: comment.blogId },
        {
          $inc: {
            "activity.totalComments": 2,
            "activity.totalParentComments": 1,
          },
        },
        { new: true }
      );
      token = repliedByUser.generateAuthToken();

      const res = await exec(reply.id);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      const {
        id,
        blog: { id: blogId },
      } = res.body.result;
      expect(id).toBe(reply.id);

      // parent comment's 'totalReplies' is decrement by 1
      const parentComment = await Comment.findById(reply.parent);
      expect(parentComment?.totalReplies).toBe(comment.totalReplies - 1);

      // check blog - 'totalComments' is decrement by 1 and 'totalParentComments' is not updated
      const updatedBlog = await Blog.findById(blogId);
      expect(updatedBlog?.activity.totalParentComments).toBe(
        blog?.activity.totalParentComments
      );
      expect(updatedBlog?.activity.totalComments).toBe(
        (blog?.activity.totalComments as number) - 1
      );
    });

    it("should delete a reply that has nested replies", async () => {
      // if we delete a reply which has nested replies then
      // 1. reply must be deleted
      // 2. Its all ancestor comment `totalReplies` must be decrement by (1 + 'totalReplies' count of deleted reply) recursively
      // 3. blog `totalParentComments` must not be changed
      //    blog `totalComments` must be decrement decrement by (1 + 'totalReplies' count of deleted reply)

      // create comment
      const comment: IComment = comments.filter((c) => c.isReply === false)[0];
      // create reply to above comment
      const reply = await Comment.create({
        blogId: comment.blogId,
        blogAuthor: comment.blogAuthor,
        commentedBy: repliedByUser,
        content: `Reply to ${comment.content}`,
        isReply: true,
        parent: comment.id,
      });
      // create reply to above reply
      await Comment.create({
        blogId: reply.blogId,
        blogAuthor: reply.blogAuthor,
        commentedBy: repliedByUser,
        content: `Reply to ${reply.content}`,
        isReply: true,
        parent: reply.id,
      });
      reply.totalReplies = 1;
      await reply.save();

      // top level comment has 2 totalReplies
      comment.totalReplies = 2;
      await comment.save();
      // add totalComments and totalParentComments on blog
      const blog = await Blog.findByIdAndUpdate(
        { _id: comment.blogId },
        {
          $inc: {
            "activity.totalComments": 3,
            "activity.totalParentComments": 1,
          },
        },
        { new: true }
      );
      token = repliedByUser.generateAuthToken();

      const res = await exec(reply.id);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      const {
        id,
        blog: { id: blogId },
      } = res.body.result;
      expect(id).toBe(reply.id);

      // parent comment's 'totalReplies' is decrement by 1 + totalReplies count on deleted reply
      const parentComment = await Comment.findById(reply.parent);
      expect(parentComment?.totalReplies).toBe(
        comment.totalReplies - (1 + reply.totalReplies)
      );

      // check blog - 'totalComments' is decrement by 1 + totalReplies count on deleted reply and 'totalParentComments' is not updated
      const updatedBlog = await Blog.findById(blogId);
      expect(updatedBlog?.activity.totalParentComments).toBe(
        blog?.activity.totalParentComments
      );
      expect(updatedBlog?.activity.totalComments).toBe(
        (blog?.activity.totalComments as number) - (1 + reply.totalReplies)
      );
    });
  });

  describe("PATCH /:id", () => {
    let blogs: IBlog[];
    let users: IUser[];
    let blogAuthor: string;
    let comments: IComment[];
    let commentedByUser: any;

    beforeAll(async () => {
      if (!server) return;
      users = await createUsers();
      blogAuthor = users[0].id;
      blogs = await createBlogs(blogAuthor);
      commentedByUser = users[1];
    });

    beforeEach(async () => {
      if (!server) return;
      comments = await createComments(
        blogs[0].id,
        blogAuthor,
        commentedByUser.id
      );
    });

    afterEach(async () => {
      if (!server) return;
      await Comment.deleteMany({});
    });

    afterAll(async () => {
      if (!server) return;
      // db cleanup
      await User.deleteMany({});
      await Blog.deleteMany({});
    });

    let token: string;
    const exec = async (id: any, payload: { content: string }) => {
      return await request(app)
        .patch(`${endpoint}/${id}`)
        .set("Cookie", `authToken=${token}`)
        .send(payload);
    };

    it("should return UnAuthorized-401 if user is not authorized", async () => {
      // token cookie is not set
      token = "";
      const commentId = new mongoose.Types.ObjectId().toString();
      const payload = { content: "updated comment" };

      const res = await exec(commentId, payload);

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toMatchObject({
        code: "UNAUTHORIZED",
        message: "Unauthorized access.",
        details: "Access Denied.Token is not provided.",
      });
    });

    it("should return BadRequest-400 if commentId is invalid", async () => {
      token = commentedByUser.generateAuthToken();
      // 'commentId' must be a valid mongodb Object id
      const commentId = "invalid-blogid";
      const payload = { content: "updated comment" };

      const res = await exec(commentId, payload);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"Id" must be a valid MongoDB ObjectId',
      });
    });

    it("should return NotFound-404 if comment does not exists", async () => {
      token = commentedByUser.generateAuthToken();
      // comment with this id does not exists
      const commentId = new mongoose.Types.ObjectId().toString();
      const payload = { content: "updated comment" };

      const res = await exec(commentId, payload);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `Comment with id = ${commentId} not found.`,
      });
    });

    it("should return Forbidden-403 if user is not allowed to perform update operation", async () => {
      const comment = comments.filter((c) => c.isReply === false)[0];
      // this user is not the comment creator
      const user: any = users.filter(
        (u) => String(u._id) !== String(comment.commentedBy)
      )[0];
      token = user.generateAuthToken();
      const payload = { content: "updated comment" };

      const res = await exec(comment.id, payload);

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toMatchObject({
        code: "FORBIDDEN",
        message: "You do not have permission to access this resource.",
        details: "You can not update this comment",
      });
    });

    it("should update a comment", async () => {
      token = commentedByUser.generateAuthToken();
      // get a comment created by authenticated user
      const comment = comments.filter(
        (c) =>
          !c.parent && String(c.commentedBy) === String(commentedByUser._id)
      )[0];
      const payload = { content: "updated comment" };

      const res = await exec(comment.id, payload);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      const { id, content, isEdited } = res.body.result;
      expect(id).toBe(comment.id);
      expect(content).toBe(payload.content);
      expect(isEdited).toBeTruthy();
    });
  });
});
