import { connect } from "mongoose";
import logger from "../utils/logger";

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await connect(`${MONGODB_URI}`, { autoIndex: true });
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error(`MongoDB connection FAILED !! ${err}`);
  }
};

export default connectDB;
