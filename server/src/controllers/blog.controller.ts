import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

const createBlog = (req: Request, res: Response) => {
  //TODO: create blog
  const user = req.user as JwtPayload;

  res.json({ authorId: user.id });
};

export { createBlog };
