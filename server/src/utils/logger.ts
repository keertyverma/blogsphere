import { createLogger, transports, Logger } from "winston";

const logger: Logger = createLogger({
  level: process.env.LOG_LEVEL?.toLowerCase() === "debug" ? "debug" : "info",
  transports: [new transports.Console()],
  exceptionHandlers: [
    new transports.File({
      filename: __dirname + "../../../logs/exceptions.log",
    }),
  ],
});

export default logger;
