import "express-async-errors";
import "dotenv/config";
import config from "config";

import logger from "./utils/logger";
import app from "./app";
import connectDB from "./db";
import { initializeFirebaseAuth } from "./utils/firebase-auth";

const PORT = process.env.PORT || 3001;

if (!config.get("secretAccessKey")) {
  logger.error("FATAL ERROR! SECRET_ACCESS_KEY is not defined");
  process.exit(1);
}

const server = app.listen(PORT, () => {
  logger.info(`App is listening on PORT - ${PORT}`);
  logger.debug(`Node Env = ${process.env.NODE_ENV}`);
  logger.debug(`App name = ${config.get("appName")}`);

  // configure google auth
  initializeFirebaseAuth();

  // connect to db
  connectDB();
});

export default server;
