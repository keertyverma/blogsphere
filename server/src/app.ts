import config from "config";
import express, { Request, Response } from "express";

import userRouter from "./routes/user.route";
import errorHandler from "./middlewares/error.middleware";

const app = express();

app.use(express.json());

// configure app routes
const BASE_URL = `/${config.get("appName")}/api/v1`;

app.get(BASE_URL, (req: Request, res: Response) => {
  res.send("Welcome to BlogSphere API");
});
app.use(`${BASE_URL}/users`, userRouter);

// error handler middleware
app.use(errorHandler);

export default app;
