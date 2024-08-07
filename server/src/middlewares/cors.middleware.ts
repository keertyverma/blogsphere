import "dotenv/config";
import cors, { CorsOptions } from "cors";

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    // Or for allowed origin only

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow credentials to be sent with requests
};

export const corsMiddleware = cors(corsOptions);
