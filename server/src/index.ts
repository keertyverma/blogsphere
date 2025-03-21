import { startServer } from "./start";
import logger from "./utils/logger";

(async () => {
  try {
    await startServer();
  } catch (error) {
    logger.error(
      `FATAL ERROR! Server startup failed!! ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    } else {
      throw error;
    }
  }
})();
