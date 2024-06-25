import "dotenv/config";
import http from "http";
import { disconnect } from "mongoose";
import request from "supertest";

import appServer from "../../../src";
import { Blog, IBlog } from "../../../src/models/blog.model";
import { User } from "../../../src/models/user.model";

let server: http.Server;
let endpoint: string = `/api/v1/blogs`;

const createUser = async () => {
  const user = await User.create({
    personalInfo: {
      fullname: "Mickey Mouse",
      password: "Clubhouse12",
      email: "test@test.com",
      username: "test",
      profileImage: "http://example-img.png",
    },
  });
  return user;
};

const createBlogs = async (userId: string) => {
  // draft blog
  const draftBlog = {
    blogId: "my-draft-blog-sub125bfjvj",
    title: "My draft blog",
    author: userId,
    isDraft: true,
  };
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

  const blogs = [draftBlog, publishedBlog1, publishedBlog2];
  await Blog.create(blogs);
  return blogs as IBlog[];
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
    afterEach(async () => {
      // db cleanup
      await User.deleteMany({});
      await Blog.deleteMany({});
      server.close();
    });

    let token: string;
    const exec = async (payload: any) => {
      return await request(server)
        .post(endpoint)
        .set("authorization", token)
        .send(payload);
    };

    beforeEach(async () => {
      const user = new User();
      token = `Bearer ${user.generateAuthToken()}`;
    });

    it("should return UnAuthorized-401 if user is not authorized", async () => {
      // token is not passed in request header
      token = "";

      const res = await exec({ title: "blog-1" });

      expect(res.statusCode).toBe(401);
      expect(res.text).toBe("Access Denied.Token is not provided.");
    });

    it("should return BadRequest-400 if token is invalid", async () => {
      token = "invalid token";

      const res = await exec({ title: "blog-1" });

      expect(res.statusCode).toBe(400);
      expect(res.text).toBe("Invalid token.");
    });

    it("should return BadRequest-400 if required parameter is not passed", async () => {
      // title, description and content are the required parameter to create blog.
      const res = await exec({ title: "Blog-1" });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"description" is required',
      });
    });

    it("should return BadRequest-400 if description exceeds 200 characters limit is not passed", async () => {
      const res = await exec({ title: "Blog-1", description: "a".repeat(201) });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details:
          '"description" length must be less than or equal to 200 characters long',
      });
    });

    it("should return BadRequest-400 if tags are more than 10", async () => {
      const res = await exec({
        title: "Blog-1",
        description: "short blog description in few words",
        tags: new Array(11).fill("some-tag"),
        content: {
          blocks: [
            {
              id: "O8uS0t2SUk",
              type: "header",
              data: {
                text: "let's setup",
                level: 2,
              },
            },
          ],
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"tags" must contain less than or equal to 10 items',
      });
    });

    it("should create draft blog if request is valid", async () => {
      // create a valid user
      const user = await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          password: "Clubhouse12",
          email: "test@test.com",
          username: "test",
        },
      });
      token = `Bearer ${user.generateAuthToken()}`;
      const totalPosts = user.accountInfo.totalPosts;

      const blog = {
        isDraft: true,
        title: "How to setup zustand ! with react app @ok ",
        coverImgURL: "https://sample.jpg",
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
      };

      const res = await exec(blog);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");

      const { id } = res.body.result;
      expect(id).toBeDefined();

      // check user
      const updatedUser = await User.findById(user.id);
      // draft blog must be added to blogs
      expect(updatedUser?.blogs).toHaveLength(1);
      // total posts should not increase
      expect(updatedUser?.accountInfo.totalPosts).toBe(totalPosts);
    });

    it("should create publish blog if request is valid", async () => {
      // create a valid user
      const user = await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          password: "Clubhouse12",
          email: "test@test.com",
          username: "test",
        },
      });
      token = `Bearer ${user.generateAuthToken()}`;
      const totalPosts = user.accountInfo.totalPosts;

      const blog = {
        title: "How to setup zustand ! with react app @ok ",
        description: "This is a short tutorial with required steps to setup",
        coverImgURL: "https://sample.jpg",
        tags: ["zustand", "reactjs"],
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
      };

      const res = await exec(blog);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");

      const { id } = res.body.result;
      expect(id).toBeDefined();

      // check user
      const updatedUser = await User.findById(user.id);
      // draft blog must be added to blogs
      expect(updatedUser?.blogs).toHaveLength(1);
      // total posts should not increase
      expect(updatedUser?.accountInfo.totalPosts).toBe(totalPosts + 1);
    });
  });

  describe("GET /", () => {
    let blogs: IBlog[];

    beforeAll(async () => {
      const user = await createUser();
      blogs = await createBlogs(user.id);
    });

    afterAll(async () => {
      // db cleanup
      await User.deleteMany({});
      await Blog.deleteMany({});
    });

    it("should return all latest published blogs from first page", async () => {
      const publishedBlogIds = blogs
        .filter((blog) => blog.isDraft === false)
        .map((blog) => blog.blogId);
      const res = await request(server).get(`${endpoint}`);

      expect(res.statusCode).toBe(200);
      const { count, previous, next, results } = res.body;
      expect(count).toBe(publishedBlogIds.length);
      expect(previous).toBeNull();
      expect(next).toBeNull();
      expect(results).toHaveLength(publishedBlogIds.length);

      // only published blog must be returned
      results.forEach((blog: IBlog) => {
        expect(publishedBlogIds.includes(blog.blogId)).toBe(true);
      });
    });

    it("should return published blogs from page 2", async () => {
      const publishedBlogIds = blogs
        .filter((blog) => blog.isDraft === false)
        .map((blog) => blog.blogId);
      const pageSize = 1;
      const res = await request(server).get(
        `${endpoint}?draft=false&page=2&pageSize=${pageSize}`
      );

      expect(res.statusCode).toBe(200);

      // total published blog is 2 and if 'pageSize' is 1 then there will be 2 pages.
      // page-2 will have 1 blog and there will be no more page so 'next = null'
      // 'previous' must point to page-1
      const { count, previous, next, results } = res.body;
      expect(count).toBe(publishedBlogIds.length);
      expect(previous).toMatch(/draft=false&page=1/i);
      expect(next).toBeNull();
      expect(results).toHaveLength(pageSize);

      // only published blog must be returned
      results.forEach((blog: IBlog) => {
        expect(publishedBlogIds.includes(blog.blogId)).toBe(true);
      });
    });

    it("should return filtered blogs when tag query parameter is set", async () => {
      // filter by tag
      const tag = "art";
      const res = await request(server).get(`${endpoint}?tag=${tag}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.results.length).toBeGreaterThan(0);

      // blog with tag must be returned
      res.body.results.forEach((blog: IBlog) => {
        expect(blog.tags).toContain(tag);
      });
    });

    it("should return latest trending blogs when ordering and limit query parameters are set", async () => {
      const res = await request(server).get(
        `${endpoint}?ordering=trending&limit=2`
      );

      expect(res.statusCode).toBe(200);

      // check limit = 2
      expect(res.body.results).toHaveLength(2);

      const [blog1, blog2] = res.body.results;
      expect(blog1.activity.totalLikes).toBeGreaterThan(
        blog2.activity.totalLikes
      );
      expect(blog1.activity.totalReads).toBeGreaterThan(
        blog2.activity.totalReads
      );
    });

    it("should return searched blogs when search query parameter is set", async () => {
      // search blog
      const searchTerm = "react";
      const res = await request(server).get(`${endpoint}?search=${searchTerm}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.results.length).toBeGreaterThan(0);

      // blog with tag must be returned
      res.body.results.forEach((blog: IBlog) => {
        expect(blog.title).toContain(searchTerm);
      });
    });

    it("should return all draft blogs", async () => {
      const res = await request(server).get(`${endpoint}?draft=true`);

      expect(res.statusCode).toBe(200);
      const draftBlogIds = blogs
        .filter((blog) => blog.isDraft === true)
        .map((blog) => blog.blogId);

      expect(res.body.results).toHaveLength(draftBlogIds.length);

      // only draft blog must be returned
      res.body.results.forEach((blog: IBlog) => {
        expect(draftBlogIds.includes(blog.blogId)).toBe(true);
      });
    });
  });

  describe("GET /:blogId", () => {
    let blogs: IBlog[];

    beforeAll(async () => {
      const user = await createUser();
      blogs = await createBlogs(user.id);
    });

    afterAll(async () => {
      // db cleanup
      await User.deleteMany({});
      await Blog.deleteMany({});
    });

    it("should return 404-NotFound if blog with given blogId is not found", async () => {
      const blogId = "invalid-blog-id";
      const res = await request(server).get(`${endpoint}/${blogId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `No blog found with blogId = ${blogId}`,
      });
    });

    it("should return blog for given valid blogId", async () => {
      const existingBlog = blogs[0];
      const blogId = existingBlog.blogId;
      const res = await request(server).get(`${endpoint}/${blogId}`);

      expect(res.statusCode).toBe(200);
      const { title, blogId: id } = res.body.result;
      expect(id).toBe(blogId);
      expect(title).toBe(existingBlog.title);
    });
  });

  describe("PATCH /:blogId/readCount", () => {
    let blogs: IBlog[];
    let user: any;

    beforeAll(async () => {
      user = await createUser();
      blogs = await createBlogs(user.id);
    });

    afterAll(async () => {
      // db cleanup
      await User.deleteMany({});
      await Blog.deleteMany({});
    });

    let token: string;
    const exec = async (blogId: string) => {
      return await request(server)
        .patch(`${endpoint}/${blogId}/readCount`)
        .set("authorization", token);
    };

    it("should return UnAuthorized-401 if user is not authorized", async () => {
      // token is not passed in request header
      token = "";

      const res = await exec("invalid-blogId");

      expect(res.statusCode).toBe(401);
      expect(res.text).toBe("Access Denied.Token is not provided.");
    });

    it("should return 404-NotFound if blog with given blogId is not found", async () => {
      token = `Bearer ${user.generateAuthToken()}`;

      const blogId = "invalid-blogId";
      const res = await exec(blogId);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `No blog found with blogId = ${blogId}`,
      });
    });

    it("should update read count of blog and user", async () => {
      token = `Bearer ${user.generateAuthToken()}`;
      const {
        blogId,
        activity: { totalReads: BlogTotalReads },
      } = blogs[1];
      const UserTotalReads = user.accountInfo.totalReads;

      const res = await exec(blogId);

      expect(res.statusCode).toBe(200);
      expect(res.body.result.activity.totalReads).toBe(BlogTotalReads + 1);

      // check blog total read increment by 1
      const blog = await Blog.findOne({ blogId });
      expect(blog).not.toBeNull();
      expect(blog?.activity.totalReads).toBe(BlogTotalReads + 1);

      // check user total read increment by 1
      const author = await User.findById(user.id);
      expect(author).not.toBeNull();
      expect(author?.accountInfo.totalReads).toBe(UserTotalReads + 1);
    });
  });

  describe("PATCH /:blogId", () => {
    let blogs: IBlog[];
    let user: any;

    beforeAll(async () => {
      user = await createUser();
      blogs = await createBlogs(user.id);
    });

    afterAll(async () => {
      // db cleanup
      await User.deleteMany({});
      await Blog.deleteMany({});
    });

    let token: string;
    const exec = async (blogId: string, payload: object = {}) => {
      return await request(server)
        .patch(`${endpoint}/${blogId}`)
        .send(payload)
        .set("authorization", token);
    };

    it("should return UnAuthorized-401 if user is not authorized", async () => {
      // token is not passed in request header
      token = "";

      const res = await exec("invalid-blogId");

      expect(res.statusCode).toBe(401);
      expect(res.text).toBe("Access Denied.Token is not provided.");
    });

    it("should return 404-NotFound if blog with given blogId is not found", async () => {
      token = `Bearer ${user.generateAuthToken()}`;

      const blogId = "invalid-blogId";
      const res = await exec(blogId);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `No blog found with blogId = ${blogId}`,
      });
    });

    it("should return BadRequest-400 if published blog description exceeds 200 characters limit is not passed", async () => {
      token = `Bearer ${user.generateAuthToken()}`;
      const publishedBlog = blogs.filter((blog) => blog.isDraft === false)[0];

      const res = await exec(publishedBlog.blogId, {
        ...publishedBlog,
        description: "a".repeat(201),
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details:
          '"description" length must be less than or equal to 200 characters long',
      });
    });

    it("should update draft blog", async () => {
      token = `Bearer ${user.generateAuthToken()}`;
      const draftBlog = blogs.filter((blog) => blog.isDraft === true)[0];
      const toUpdate = {
        title: `updated ${draftBlog.title}`,
        content: {
          blocks: [
            {
              id: "O8uS0t2SUk",
              type: "header",
              data: {
                text: "My blog heading",
                level: 2,
              },
            },
          ],
        },
        isDraft: true,
      };

      const res = await exec(draftBlog.blogId, toUpdate);

      expect(res.statusCode).toBe(200);
      const { blogId, title, isDraft, content } = res.body.result;
      expect(blogId).toBe(draftBlog.blogId);
      expect(title).toBe(toUpdate.title);
      expect(content.blocks).toHaveLength(1);
      expect(isDraft).toBe(toUpdate.isDraft);

      // when draft blog is updated then it should not update user total post
      const author = await User.findById(draftBlog.author);
      expect(author?.accountInfo.totalPosts).toBe(0);
    });

    it("should update draft blog and publish it", async () => {
      token = `Bearer ${user.generateAuthToken()}`;
      const draftBlog = blogs.filter((blog) => blog.isDraft === true)[0];
      const toUpdate = {
        title: draftBlog.title,
        description: "some meaningful short description",
        content: {
          blocks: [
            {
              id: "O8uS0t2SUk",
              type: "header",
              data: {
                text: "My blog heading",
                level: 2,
              },
            },
          ],
        },
        tags: ["tag1", "tag2"],
        isDraft: false,
      };

      const res = await exec(draftBlog.blogId, toUpdate);

      expect(res.statusCode).toBe(200);
      const { blogId, content, description, tags, isDraft } = res.body.result;
      expect(blogId).toBe(draftBlog.blogId);
      expect(content.blocks).toHaveLength(1);
      expect(description).toBe(toUpdate.description);
      expect(tags).toEqual(toUpdate.tags);
      expect(isDraft).toBe(toUpdate.isDraft);

      // when draft blog is updated then it should not update user total post
      const author = await User.findById(draftBlog.author);
      expect(author?.accountInfo.totalPosts).toBe(1);
    });
  });

  describe("PATCH /:blogId/like", () => {
    let blogs: IBlog[];
    let user: any;

    beforeAll(async () => {
      user = await createUser();
      blogs = await createBlogs(user.id);
    });

    afterAll(async () => {
      // db cleanup
      await User.deleteMany({});
      await Blog.deleteMany({});
    });

    let token: string;
    const exec = async (blogId: string) => {
      return await request(server)
        .patch(`${endpoint}/${blogId}/like`)
        .set("authorization", token);
    };

    it("should return UnAuthorized-401 if user is not authorized", async () => {
      // token is not passed in request header
      token = "";

      const res = await exec("invalid-blogId");

      expect(res.statusCode).toBe(401);
      expect(res.text).toBe("Access Denied.Token is not provided.");
    });

    it("should return 404-NotFound if blog with given blogId is not found", async () => {
      token = `Bearer ${user.generateAuthToken()}`;

      const blogId = "invalid-blogId";
      const res = await exec(blogId);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `No blog found with blogId = ${blogId}`,
      });
    });

    it("should like blog if user has not already liked", async () => {
      token = `Bearer ${user.generateAuthToken()}`;
      const publishedBlog = blogs.filter((blog) => blog.isDraft === false)[0];

      const res = await exec(publishedBlog.blogId);

      expect(res.statusCode).toBe(200);
      const {
        blogId,
        activity: { totalLikes },
      } = res.body.result;
      expect(blogId).toBe(publishedBlog.blogId);
      expect(totalLikes).toBe(publishedBlog.activity.totalLikes + 1);

      // check user added in blog likes in db
      const blog = await Blog.findOne({ blogId: publishedBlog.blogId });
      const likes = blog?.toJSON().likes;
      expect(likes?.hasOwnProperty(user.id)).toBe(true);
    });

    it("should unlike blog if user has already liked", async () => {
      token = `Bearer ${user.generateAuthToken()}`;
      const publishedBlog = blogs.filter((blog) => blog.isDraft === false)[0];
      // add user in blog likes map
      let existingBlog = await Blog.findOne({ blogId: publishedBlog.blogId });
      existingBlog?.likes.set(user.id, true);
      await existingBlog?.save();
      const expectedTotalLikes = publishedBlog.activity.totalLikes + 1 - 1;

      const res = await exec(publishedBlog.blogId);

      expect(res.statusCode).toBe(200);
      const {
        blogId,
        activity: { totalLikes },
      } = res.body.result;
      expect(blogId).toBe(publishedBlog.blogId);
      expect(totalLikes).toBe(expectedTotalLikes);

      // check user removed from blog likes in db
      const blog = await Blog.findOne({ blogId: publishedBlog.blogId });
      const likes = blog?.toJSON().likes;
      expect(likes?.hasOwnProperty(user.id)).toBe(false);
    });
  });

  describe("DELETE /:blogId", () => {
    let blogs: IBlog[];
    let user: any;

    beforeAll(async () => {
      user = await createUser();
      blogs = await createBlogs(user.id);
    });

    afterAll(async () => {
      // db cleanup
      await User.deleteMany({});
      await Blog.deleteMany({});
    });

    let token: string;
    const exec = async (blogId: string, payload: object = {}) => {
      return await request(server)
        .delete(`${endpoint}/${blogId}`)
        .set("authorization", token);
    };

    it("should return UnAuthorized-401 if user is not authorized", async () => {
      // token is not passed in request header
      token = "";

      const res = await exec("invalid-blogId");

      expect(res.statusCode).toBe(401);
      expect(res.text).toBe("Access Denied.Token is not provided.");
    });

    it("should return 404-NotFound if blog with given blogId is not found", async () => {
      token = `Bearer ${user.generateAuthToken()}`;

      const blogId = "invalid-blogId";
      const res = await exec(blogId);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `No blog found with blogId = ${blogId}`,
      });
    });

    it("should delete draft blog if blogId is valid", async () => {
      // setup - get draft blog
      token = `Bearer ${user.generateAuthToken()}`;
      const draftBlogId = blogs.filter((blog) => blog.isDraft === true)[0]
        ?.blogId;
      const draftBlog = await Blog.findOne({ blogId: draftBlogId });
      // add blog to user blogs list
      const blogAuthor = await User.findByIdAndUpdate(
        draftBlog?.author,
        {
          $push: {
            blogs: draftBlog?.id,
          },
        },
        { new: true }
      );
      const totalPost = blogAuthor?.accountInfo.totalPosts;

      // call api
      const res = await exec(draftBlogId);

      // assertions
      expect(res.statusCode).toBe(200);
      const {
        blogId,
        isDraft,
        authorDetails: { _id },
      } = res.body.result;
      expect(blogId).toBe(draftBlog?.blogId);
      expect(isDraft).toBe(draftBlog?.isDraft);

      // blog must be removed from author blog list
      const author = await User.findById(_id);
      expect(author?.blogs).not.toContain(draftBlog?.id);

      // when draft blog is deleted then user total post must not change
      expect(author?.accountInfo.totalPosts).toBe(totalPost);
    });

    it("should delete published blog and decrement author total post count", async () => {
      // setup - get published blog
      token = `Bearer ${user.generateAuthToken()}`;
      const publishedBlogId = blogs.filter((blog) => blog.isDraft === false)[0]
        ?.blogId;
      const publishedBlog = await Blog.findOne({ blogId: publishedBlogId });
      // add blog and update totalPost count for blog author
      const blogAuthor = await User.findByIdAndUpdate(
        publishedBlog?.author,
        {
          $inc: { "accountInfo.totalPosts": 1 },
          $push: {
            blogs: publishedBlog?.id,
          },
        },
        { new: true }
      );
      const totalPost = blogAuthor?.accountInfo.totalPosts;

      // call api
      const res = await exec(publishedBlogId);

      // assertion
      expect(res.statusCode).toBe(200);
      const {
        blogId,
        isDraft,
        authorDetails: { _id },
      } = res.body.result;
      expect(blogId).toBe(publishedBlogId);
      expect(isDraft).toBe(publishedBlog?.isDraft);

      // blog must be removed from author blog list
      const author = await User.findById(_id);
      expect(author?.blogs).not.toContain(publishedBlog?.id);

      // when published blog is deleted then user total post must be decrement by 1
      if (totalPost) {
        expect(author?.accountInfo.totalPosts).toBe(totalPost - 1);
      }
    });
  });
});
