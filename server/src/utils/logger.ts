import fs from "fs";
import path from "path";
import { Logger, createLogger, transports, LoggerOptions } from "winston";

const loggerOptions: LoggerOptions = {
  level: process.env.LOG_LEVEL?.toLowerCase() === "debug" ? "debug" : "info",
  transports: [new transports.Console()],
};

if (process.env.NODE_ENV !== "production") {
  // check if logs directory exists, if not create it
  const logDir = path.join(__dirname, "../../logs");
  try {
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  } catch (error) {
    console.error("Failed to create log directory:", error);
  }

  loggerOptions.exceptionHandlers = [
    new transports.File({ filename: path.join(logDir, "exceptions.log") }),
  ];
}

const logger: Logger = createLogger(loggerOptions);

export default logger;
