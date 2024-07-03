import "dotenv/config";
import http from "http";
import mongoose, { disconnect } from "mongoose";
import request from "supertest";

import appServer from "../../../src";
import { Blog, IBlog } from "../../../src/models/blog.model";
import { IUser, User } from "../../../src/models/user.model";
import { IComment, Comment } from "../../../src/models/comment.model";

let server: http.Server;
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

  const users = await User.create([user1, user2]);
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
  afterAll(async () => {
    // close the MongoDB connection
    await disconnect();
  });

  beforeEach(() => {
    server = appServer;
  });

  afterEach(() => {
    server.close();
  });

  describe("POST /", () => {
    let blogs: IBlog[];
    let users: IUser[];
    let blogAuthor: string;
    let commentedByUser: any;

    beforeAll(async () => {
      users = await createUsers();
      blogAuthor = users[0].id;
      commentedByUser = users[1];
      blogs = await createBlogs(blogAuthor);
    });

    afterAll(async () => {
      // db cleanup
      await User.deleteMany({});
      await Blog.deleteMany({});
    });

    let token: string;
    const exec = async (payload: any) => {
      return await request(server)
        .post(endpoint)
        .set("authorization", token)
        .send(payload);
    };

    it("should return UnAuthorized-401 if user is not authorized", async () => {
      // token is not passed in request header
      token = "";
      const blogId = new mongoose.Types.ObjectId().toString();

      const res = await exec({ blogId, content: "some thoughtful comment" });

      expect(res.statusCode).toBe(401);
      expect(res.text).toBe("Access Denied.Token is not provided.");
    });

    it("should return BadRequest-400 if token is invalid", async () => {
      token = "invalid token";
      const blogId = new mongoose.Types.ObjectId().toString();

      const res = await exec({ blogId, content: "some thoughtful comment" });

      expect(res.statusCode).toBe(400);
      expect(res.text).toBe("Invalid token.");
    });

    it("should return BadRequest-400 if blogId parameter is not of the correct type", async () => {
      token = `Bearer ${commentedByUser.generateAuthToken()}`;
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
      token = `Bearer ${commentedByUser.generateAuthToken()}`;
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
      token = `Bearer ${commentedByUser.generateAuthToken()}`;
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

      // check blog
      const updatedBlog = await Blog.findById(blogId);
      //  comment is added in blog 'comments' array
      expect(updatedBlog).not.toBeNull();
      expect(updatedBlog?.comments.includes(id)).toBeTruthy();

      // 'totalComments' and 'totalParentComments' is increment by 1
      expect(updatedBlog?.activity.totalComments).toBe(1);
      expect(updatedBlog?.activity.totalParentComments).toBe(1);
    });
  });

  describe(`GET /`, () => {
    let blogs: IBlog[];
    let comments: IComment[];

    beforeAll(async () => {
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
      // db cleanup
      await User.deleteMany({});
      await Blog.deleteMany({});
      await Comment.deleteMany({});
    });

    it("should return BadRequest-400 if blogId parameter is invalid", async () => {
      // 'blogId' must be a valid mongodb Object id
      const blogId = "invalid-blogid";

      const res = await request(server).get(`${endpoint}?blogId=${blogId}`);

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

      const res = await request(server).get(
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

      const res = await request(server).get(
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

      const res = await request(server).get(
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
});
