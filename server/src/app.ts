import config from "config";
import express, { Request, Response } from "express";
import cors from "cors";

import userRouter from "./routes/user.route";
import authRouter from "./routes/auth.route";
import errorHandler from "./middlewares/error.middleware";
import routeNotFoundHandler from "./middlewares/route-not-found.middleware";

const app = express();

app.use(express.json());

app.use(cors({ exposedHeaders: ["x-auth-token"] }));

// configure app routes
const BASE_URL = `/${config.get("appName")}/api/v1`;

app.get(BASE_URL, (req: Request, res: Response) => {
  res.send("Welcome to BlogSphere API");
});
app.use(`${BASE_URL}/users`, userRouter);
app.use(`${BASE_URL}/auth`, authRouter);

// error handler middleware
app.use(routeNotFoundHandler);
app.use(errorHandler);

export default app;
