import { Application } from "express";
import { Server } from "http";
import { disconnect } from "mongoose";
import request from "supertest";

import { startServer } from "../../../src/start";

let server: Server;
let app: Application; // Express instance
let endpoint: string = `/api/v1/health/`;

describe("/health route", () => {
  beforeAll(async () => {
    try {
      ({ server, app } = await startServer());
    } catch (error) {
      console.error(
        "🚨 Test server startup failed!\n",
        error instanceof Error ? error.message : String(error)
      );
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  });

  afterAll(async () => {
    if (!server) return;
    server.close();
    await disconnect();
  });

  it("should return 200 and a status message", async () => {
    const response = await request(app).get(endpoint);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "ok");
  });
});
