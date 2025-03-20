import { startServer } from "./start";
import logger from "./utils/logger";

(async () => {
  try {
    await startServer();
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      logger.error("Fatal error: Server startup failed!! \n", error);
      process.exit(1);
    } else {
      throw error;
    }
  }
})();
