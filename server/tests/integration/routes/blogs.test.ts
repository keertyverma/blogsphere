import request from "supertest";
import { disconnect } from "mongoose";
import "dotenv/config";
import config from "config";
import http from "http";

import appServer from "../../../src";
import { User } from "../../../src/models/user.model";
import { Blog } from "../../../src/models/blog.model";

let server: http.Server;
let endpoint: string = `/${config.get("appName")}/api/v1/blogs`;

describe("/api/v1/blogs", () => {
  afterAll(async () => {
    // close the MongoDB connection
    await disconnect();
  });

  beforeEach(() => {
    server = appServer;
  });

  afterEach(async () => {
    server.close();
    // db cleanup
    await User.deleteMany({});
    await Blog.deleteMany({});
  });

  describe("POST /", () => {
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

      const { id } = res.body.data;
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

      const { id } = res.body.data;
      expect(id).toBeDefined();

      // check user
      const updatedUser = await User.findById(user.id);
      // draft blog must be added to blogs
      expect(updatedUser?.blogs).toHaveLength(1);
      // total posts should not increase
      expect(updatedUser?.accountInfo.totalPosts).toBe(totalPosts + 1);
    });
  });

  describe("GET /latest", () => {
    it("should return all latest blogs", async () => {
      const user = await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          password: "Clubhouse12",
          email: "test@test.com",
          username: "test",
          profileImage: "http://example-img.png",
        },
      });

      // create a few draft and published blogs
      const draftBlog = {
        blogId: "my-draft-blog-sub125bfjvj",
        title: "My draft blog",
        author: user.id,
        isDraft: true,
      };

      const publishedBlog = {
        isDraft: false,
        blogId: "how-to-setup-zustand-with-react-app-oki178bfopl",
        title: "How to setup zustand ! with react app @ok ",
        description: "some short description",
        coverImgURL: "https://sample.jpg",
        author: user.id,
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
      };

      await Blog.create([draftBlog, publishedBlog]);

      const res = await request(server).get(`${endpoint}/latest`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");

      // only published blog must be returned
      expect(res.body.data).toHaveLength(1);
      const {
        blogId,
        author: {
          personalInfo: { username },
        },
      } = res.body.data[0];

      expect(blogId).toBe(publishedBlog.blogId);
      expect(username).toBe(user.personalInfo.username);
    });
  });

  describe("GET /trending", () => {
    it("should return latest trending blogs", async () => {
      const user = await User.create({
        personalInfo: {
          fullname: "Mickey Mouse",
          password: "Clubhouse12",
          email: "test@test.com",
          username: "test",
          profileImage: "http://example-img.png",
        },
      });

      // create blogs
      const blog1 = {
        isDraft: false,
        blogId: "blog-1-how-to-setup-zustand-with-react-app-oki178bfopl",
        title: "blog-1-How to setup zustand ! with react app @ok ",
        description: "some short description",
        coverImgURL: "https://sample.jpg",
        author: user.id,
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
        tags: ["tag1", "tag2", "tag3"],
        activity: {
          totalLikes: 1,
          totalReads: 2,
        },
      };

      const blog2 = {
        isDraft: false,
        blogId: "blog-2-how-to-setup-zustand-with-react-app-oki178bfopl",
        title: "blog-2-How to setup zustand ! with react app @ok ",
        description: "some short description",
        coverImgURL: "https://sample.jpg",
        author: user.id,
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
          totalLikes: 5,
          totalReads: 5,
        },
      };

      await Blog.create([blog1, blog2]);

      const res = await request(server).get(`${endpoint}/trending`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");

      // only published blog must be returned
      expect(res.body.data).toHaveLength(2);

      const b1 = res.body.data[0];
      const b2 = res.body.data[1];
      // blog2 likes and read are more than blog1
      expect(b1.blogId).toBe(blog2.blogId);
      expect(b2.blogId).toBe(blog1.blogId);
    });
  });
});
