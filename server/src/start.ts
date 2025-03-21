// Load environment variables
import dotenv from "dotenv";
const result = dotenv.config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});
if (result.error) {
  console.error(`❌ Failed to load env file: ${result.error}`);
}

// Ensure dotenv is loaded before other modules
import config from "config";
import "express-async-errors";
import { Server } from "http";

import app from "./app";
import { connectDB } from "./db";
import { initializeFirebaseAuth } from "./utils/firebase-auth";
import logger from "./utils/logger";

const PORT = process.env.PORT || 3001;

if (!config.get("secretAccessKey")) {
  logger.error("FATAL ERROR! SECRET_ACCESS_KEY is not defined");
  process.exit(1);
}

export const startServer = async (): Promise<{
  server: Server;
  app: typeof app;
}> => {
  await connectDB(); // Ensure DB connection before starting the server
  initializeFirebaseAuth(); // configure google auth

  const server = app.listen(PORT, () => {
    logger.info(`App is listening on PORT - ${PORT}`);
    logger.debug(`Node Env = ${process.env.NODE_ENV}`);
    logger.debug(`App name = ${config.get("appName")}`);
  });

  return { server, app };
};
