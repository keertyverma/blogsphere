import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const routeNotFoundHandler = (req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).send("Route does not exist");
};

export default routeNotFoundHandler;
