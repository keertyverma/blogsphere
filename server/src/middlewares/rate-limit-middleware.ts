import config from "config";
import { rateLimit } from "express-rate-limit";
import ms from "ms";

const GLOBAL_MAX_REQUESTS = config.get(
  "rateLimiter.globalMaxRequestsPerHour"
) as number;
const RESEND_EMAIL_MAX_REQUESTS = config.get(
  "rateLimiter.resendEmailMaxRequestsPerHour"
) as number;

const createRateLimiter = (maxRequest: number, message: string) =>
  rateLimit({
    windowMs: ms("1h"),
    max: maxRequest,
    message,
    // Use modern HTTP rate-limiting headers (RFC draft-7). Sends "RateLimit-Policy" and "RateLimit" headers
    standardHeaders: "draft-7",
    // Do not send legacy "X-RateLimit-Limit", "X-RateLimit-Remaining", and "X-RateLimit-Reset" headers
    legacyHeaders: false,
    validate: {
      xForwardedForHeader: false, // Disable validation for X-Forwarded-For header
    },
  });

export const rateLimiter = createRateLimiter(
  GLOBAL_MAX_REQUESTS,
  `You have exceeded your ${GLOBAL_MAX_REQUESTS} requests per hour limit.`
);
export const resendEmailRateLimiter = createRateLimiter(
  RESEND_EMAIL_MAX_REQUESTS,
  `You have exceeded your ${RESEND_EMAIL_MAX_REQUESTS} requests per hour limit for resending emails.`
);
