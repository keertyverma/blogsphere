import { connect, connection } from "mongoose";
import logger from "../utils/logger";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("'MONGODB_URI' is not defined in environment variables.");
    }
    await connect(uri, { autoIndex: true });
    logger.info("MongoDB connected");
  } catch (err) {
    throw new Error(
      `MongoDB connection FAILED !! ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
};

const checkDatabaseConnection = () => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  return {
    status: connection.readyState === 1 ? "ok" : "error",
    connectionState: states[connection.readyState] || "unknown",
  };
};

export { checkDatabaseConnection, connectDB };
