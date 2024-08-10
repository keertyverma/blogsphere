import { rateLimit } from "express-rate-limit";
import ms from "ms";

const MAX_COUNT = 1000;

export const rateLimiter = rateLimit({
  windowMs: ms("1h"),
  max: MAX_COUNT,
  message: `You have exceeded your ${MAX_COUNT} requests per hour limit.`,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false, // Disable validation for X-Forwarded-For header
  },
});

const MAX_RESEND_EMAIL_API_COUNT = 5;

export const resendEmailRateLimiter = rateLimit({
  windowMs: ms("1h"),
  max: MAX_RESEND_EMAIL_API_COUNT,
  message: `You have exceeded your ${MAX_RESEND_EMAIL_API_COUNT} requests per hour limit for resending emails.`,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false, // Disable validation for X-Forwarded-For header
  },
});
