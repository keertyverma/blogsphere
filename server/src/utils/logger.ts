import fs from "fs";
import path from "path";
import { Logger, createLogger, transports } from "winston";

// check if logs directory exists, if not create it
const logDir = path.join(__dirname, "../../logs");
try {
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
} catch (error) {
  console.error("Failed to create log directory:", error);
}

const logger: Logger = createLogger({
  level: process.env.LOG_LEVEL?.toLowerCase() === "debug" ? "debug" : "info",
  transports: [new transports.Console()],
  exceptionHandlers: [
    new transports.File({ filename: path.join(logDir, "exceptions.log") }),
  ],
});

export default logger;
