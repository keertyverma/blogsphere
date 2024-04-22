import express, { Request, Response } from "express";

const app = express();

// configure app routes
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to BlogSphere API");
});

export default app;
