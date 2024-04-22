import { createLogger, transports, Logger } from "winston";

const logger: Logger = createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  transports: [new transports.Console()],
  exceptionHandlers: [
    new transports.File({
      filename: __dirname + "../../../logs/exceptions.log",
    }),
  ],
});

export default logger;
