import config from "config";
import express, { Request, Response } from "express";

const app = express();

// configure app routes
const BASE_URL = `/${config.get("appName")}/api/v1`;

app.get(BASE_URL, (req: Request, res: Response) => {
  res.send("Welcome to BlogSphere API");
});

export default app;
