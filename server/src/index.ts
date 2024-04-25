import "express-async-errors";
import "dotenv/config";
import config from "config";

import logger from "./utils/logger";
import app from "./app";
import connectDB from "./db";

const PORT = process.env.PORT || 3001;

// connect to db
connectDB();

app.listen(PORT, () => {
  logger.info(`App is listening on PORT - ${PORT}`);
  logger.debug(`Node Env = ${process.env.NODE_ENV}`);
  logger.debug(`App name = ${config.get("appName")}`);
});
