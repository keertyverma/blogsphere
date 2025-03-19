import http from "http";
import { disconnect } from "mongoose";
import request from "supertest";
import appServer from "../../../src";
import { connectDB } from "../../../src/db";

let server: http.Server;
let endpoint: string = `/api/v1/health/`;

describe("/health route", () => {
  beforeAll(async () => {
    try {
      await connectDB();
    } catch (error) {
      console.error("Skipping tests due to database connection failure.");
      return;
    }
  });

  beforeEach(() => {
    server = appServer;
  });

  afterEach(async () => {
    server.close();
  });

  afterAll(async () => {
    // close the MongoDB connection
    await disconnect();
  });

  it("should return 200 and a status message", async () => {
    const response = await request(server).get(endpoint);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "ok");
  });
});
