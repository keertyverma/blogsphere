import "dotenv/config";
import http from "http";
import mongoose, { disconnect } from "mongoose";
import request from "supertest";

import appServer from "../../../src";
import { Blog, IBlog } from "../../../src/models/blog.model";
import { Bookmark, IBookmark } from "../../../src/models/bookmark.model";
import { IUser, User } from "../../../src/models/user.model";

let server: http.Server;
let endpoint: string = `/api/v1/bookmarks`;

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

const createBookmarks = async (
  userId: string,
  blogId1: string,
  blogId2: string
) => {
  const bookmark1 = {
    userId,
    blogId: blogId1,
  };

  const bookmark2 = {
    userId,
    blogId: blogId2,
  };

  const bookmarks = await Bookmark.create([bookmark1, bookmark2]);
  return bookmarks;
};

describe("/api/v1/bookmarks", () => {
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

  describe("POST /:blogId", () => {
    // Add a bookmark for specified user and blog
    let blogs: IBlog[];
    let users: IUser[];
    let authenticatedUser: any;
    let token: string;

    beforeAll(async () => {
      users = await createUsers();
      const blogAuthor = users[0].id;
      authenticatedUser = users[1];
      blogs = await createBlogs(blogAuthor);
    });

    afterAll(async () => {
      // db cleanup
      await User.deleteMany({});
      await Blog.deleteMany({});
      server.close();
    });

    beforeEach(async () => {
      token = authenticatedUser.generateAuthToken();
    });

    afterEach(async () => {
      await Bookmark.deleteMany({});
    });

    const exec = async (blogId: string = "") => {
      return await request(server)
        .post(`${endpoint}/${blogId}`)
        .set("Cookie", `authToken=${token}`);
    };

    it("should return UnAuthorized-401 if user is not authorized", async () => {
      // token cookie is not set
      token = "";
      const blogId = new mongoose.Types.ObjectId().toString();
      const res = await exec(blogId);

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
      const res = await exec(blogId);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Invalid auth token.",
      });
    });

    it("should return BadRequest-400 if blogId is invalid", async () => {
      // blogId must be a valid mongoDB object Id format
      const blogId = "invalid-blogId";
      const res = await exec(blogId);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"blogId" must be a valid MongoDB ObjectId',
      });
    });

    it("should return NotFoundError-404 if blog does not exists", async () => {
      // blog does not exists
      const blogId = new mongoose.Types.ObjectId().toString();
      const res = await exec(blogId);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `No blog found with blogId = ${blogId}`,
      });
    });

    it("should return BadRequest-400 if bookmark already exists", async () => {
      // create bookmark
      const blogId = blogs[0].id;
      await Bookmark.create({
        userId: authenticatedUser.id,
        blogId,
      });

      const res = await exec(blogId);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Blog already bookmarked",
      });
    });

    it("should add a bookmark for specified user and blog", async () => {
      const blog_Id = blogs[0].id;

      const res = await exec(blog_Id);

      expect(res.statusCode).toBe(201);
      const { _id, blogId, userId } = res.body.result;
      expect(_id).toBeDefined();
      expect(blogId).toBe(blog_Id);
      expect(userId).toBe(authenticatedUser.id);
    });
  });

  describe("DELETE /:blogId", () => {
    // Delete a bookmark for specified user and blog
    let blogs: IBlog[];
    let users: IUser[];
    let authenticatedUser: any;
    let token: string;

    beforeAll(async () => {
      users = await createUsers();
      const blogAuthor = users[0].id;
      authenticatedUser = users[1];
      blogs = await createBlogs(blogAuthor);
    });

    afterAll(async () => {
      // db cleanup
      await User.deleteMany({});
      await Blog.deleteMany({});
      server.close();
    });

    beforeEach(async () => {
      token = authenticatedUser.generateAuthToken();
    });

    afterEach(async () => {
      await Bookmark.deleteMany({});
    });

    const exec = async (blogId: string = "") => {
      return await request(server)
        .delete(`${endpoint}/${blogId}`)
        .set("Cookie", `authToken=${token}`);
    };

    it("should return UnAuthorized-401 if user is not authorized", async () => {
      // token cookie is not set
      token = "";
      const blogId = new mongoose.Types.ObjectId().toString();

      const res = await exec(blogId);

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

      const res = await exec(blogId);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Invalid auth token.",
      });
    });

    it("should return BadRequest-400 if blogId is invalid", async () => {
      // blogId must be a valid mongoDB object Id format
      const blogId = "invalid-blogId";

      const res = await exec(blogId);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"blogId" must be a valid MongoDB ObjectId',
      });
    });

    it("should return NotFoundError-404 if bookmark does not exists", async () => {
      const blogId = blogs[0].id;

      const res = await exec(blogId);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: "No bookmark found for the specified user and blog",
      });
    });

    it("should remove bookmark for specified user and blog", async () => {
      // create bookmark
      const blog_Id = blogs[0].id;
      const bookmark = await Bookmark.create({
        userId: authenticatedUser.id,
        blogId: blog_Id,
      });

      const res = await exec(bookmark.blogId);

      expect(res.statusCode).toBe(200);
      const { _id, blogId, userId } = res.body.result;
      expect(_id).toBeDefined();
      expect(blogId).toBe(blog_Id);
      expect(userId).toBe(authenticatedUser.id);
    });
  });

  describe("GET /users/:userId", () => {
    // Get all bookmarked blogs for given user
    let blogs: IBlog[];
    let users: IUser[];
    let bookmarks: IBookmark[];
    let authenticatedUser: any;

    beforeAll(async () => {
      users = await createUsers();

      const blogAuthor = users[0].id;
      blogs = await createBlogs(blogAuthor);

      authenticatedUser = users[1];
      bookmarks = await createBookmarks(
        authenticatedUser.id,
        blogs[0].id,
        blogs[1].id
      );
    });

    afterAll(async () => {
      // db cleanup
      await User.deleteMany({});
      await Blog.deleteMany({});
      await Bookmark.deleteMany({});
      server.close();
    });

    it("should return BadRequest-400 if userId is invalid", async () => {
      // userId must be a valid mongoDB object Id format
      const userId = "invalid-userId";

      const res = await request(server).get(`${endpoint}/users/${userId}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"userId" must be a valid MongoDB ObjectId',
      });
    });

    it("should return BadRequest-400 if blogId is invalid", async () => {
      // blogId must be a valid mongoDB object Id format
      const userId = authenticatedUser.id;
      const blogId = "invalid-blogId";

      const res = await request(server).get(
        `${endpoint}/users/${userId}?blogId=${blogId}`
      );

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"blogId" must be a valid MongoDB ObjectId',
      });
    });

    it("should return bookmark for specified user and blog", async () => {
      const user_Id = authenticatedUser.id;
      const userBookmarks = bookmarks.filter((b) => (b.userId = user_Id));
      const blogId = userBookmarks[0].blogId;

      const res = await request(server).get(
        `${endpoint}/users/${user_Id}?blogId=${blogId}`
      );

      expect(res.statusCode).toBe(200);

      const { count, previous, next, results } = res.body;
      expect(count).toBe(1);
      expect(previous).toBeNull();
      expect(next).toBeNull();
      expect(results).toHaveLength(1);

      const { userId } = results[0];
      expect(userId).toBe(user_Id);
    });

    it("should return all bookmarks for given user", async () => {
      const user_Id = authenticatedUser.id;
      const userBookmarks = bookmarks.filter((b) => (b.userId = user_Id));

      const res = await request(server).get(`${endpoint}/users/${user_Id}`);

      expect(res.statusCode).toBe(200);

      const { count, previous, next, results } = res.body;
      expect(count).toBe(userBookmarks.length);
      expect(previous).toBeNull();
      expect(next).toBeNull();
      expect(results).toHaveLength(userBookmarks.length);
    });

    it("should return bookmarks for user from page 2", async () => {
      const user_Id = authenticatedUser.id;
      const userBookmarks = bookmarks.filter((b) => (b.userId = user_Id));
      const pageSize = 1;

      const res = await request(server).get(
        `${endpoint}/users/${user_Id}?page=2&pageSize=${pageSize}`
      );

      expect(res.statusCode).toBe(200);

      const { count, previous, next, results } = res.body;
      expect(count).toBe(userBookmarks.length);
      expect(previous).toMatch(/page=1/i);
      expect(next).toBeNull();
      expect(results).toHaveLength(pageSize);
    });
  });
});
