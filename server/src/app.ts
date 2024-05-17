import config from "config";
import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import helmet from "helmet";
import compression from "compression";

import { userRouter, authRouter, uploadRouter, blogRouter } from "./routes";
import { errorHandler, routeNotFoundHandler, rateLimiter } from "./middlewares";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(cors({ exposedHeaders: ["x-auth-token"] }));

// if (process.env.NODE_ENV === "production") {
//   app.use(helmet());
//   app.use(compression());
//   app.use(rateLimiter);
// }

app.use(helmet());
app.use(compression());
app.use(rateLimiter);

// configure app routes
const BASE_URL = `/api/v1`;

app.get(BASE_URL, (req: Request, res: Response) => {
  res.send("Welcome to BlogSphere API");
});
app.use(`${BASE_URL}/users`, userRouter);
app.use(`${BASE_URL}/auth`, authRouter);
app.use(`${BASE_URL}/upload`, uploadRouter);
app.use(`${BASE_URL}/blogs`, blogRouter);

// error handler middleware
app.use(routeNotFoundHandler);
app.use(errorHandler);

export default app;
