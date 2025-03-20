import config from "config";
import { connect, connection } from "mongoose";
import logger from "../utils/logger";

const MONGODB_URI = `mongodb+srv://${config.get("database.user")}:${config.get(
  "database.password"
)}@blogsphere.8uy0ntc.mongodb.net/${config.get(
  "database.name"
)}?retryWrites=true&w=majority&appName=blogsphere`;

const connectDB = async () => {
  try {
    await connect(MONGODB_URI, { autoIndex: true });
    logger.info("MongoDB connected");
  } catch (err) {
    throw new Error(`MongoDB connection FAILED !! ${err}`);
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
