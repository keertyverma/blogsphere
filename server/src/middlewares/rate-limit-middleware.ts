import { rateLimit } from "express-rate-limit";
import ms from "ms";

const MAX_COUNT = 200;

const rateLimiter = rateLimit({
  windowMs: ms("1h"),
  max: MAX_COUNT,
  message: `You have exceeded your ${MAX_COUNT} requests per hour limit.`,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false, // Disable validation for X-Forwarded-For header
  },
});

export default rateLimiter;
