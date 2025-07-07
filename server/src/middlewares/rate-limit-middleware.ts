import config from "config";
import { rateLimit } from "express-rate-limit";
import { JwtPayload } from "jsonwebtoken";
import ms from "ms";

export interface RateLimitOptions {
  window: string; // e.g., "1m", "1h", "10s"
  perUser?: boolean; // If true, rate limit is applied per authenticated user
}

// Load max request limits from config
const GLOBAL_MAX_REQUESTS = config.get<number>(
  "rateLimiter.globalMaxRequestsPerHour"
);
const RESEND_EMAIL_MAX_REQUESTS = config.get<number>(
  "rateLimiter.resendEmailMaxRequestsPerHour"
);
const AI_METADATA_GLOBAL_MAX_REQUESTS = config.get<number>(
  "rateLimiter.aiMetadataGlobalMaxRequestsPerMinute"
);
const AI_METADATA_PER_USER_MAX_REQUESTS = config.get<number>(
  "rateLimiter.aiMetadataPerUserMaxRequestsPerMinute"
);

const createRateLimiter = (
  maxRequest: number,
  message: string,
  options?: RateLimitOptions
) =>
  rateLimit({
    windowMs: ms(options?.window ?? "1h"),
    max: maxRequest,
    message,
    // Use user ID if per-user is enabled; otherwise, fallback to IP
    keyGenerator: (req) =>
      options?.perUser && (req.user as JwtPayload)?.id
        ? (req.user as JwtPayload).id
        : req.ip,
    // Use modern HTTP rate-limiting headers (RFC draft-7). Sends "RateLimit-Policy" and "RateLimit" headers
    standardHeaders: "draft-7",
    // Do not send legacy "X-RateLimit-Limit", "X-RateLimit-Remaining", and "X-RateLimit-Reset" headers
    legacyHeaders: false,
    validate: {
      xForwardedForHeader: false, // Disable validation for X-Forwarded-For header
    },
  });

// Global rate limiter (per IP, per hour)
export const rateLimiter = createRateLimiter(
  GLOBAL_MAX_REQUESTS,
  `You have exceeded your ${GLOBAL_MAX_REQUESTS} requests per hour limit.`
);

// Resend email limiter (per IP, per hour)
export const resendEmailRateLimiter = createRateLimiter(
  RESEND_EMAIL_MAX_REQUESTS,
  `You have exceeded your ${RESEND_EMAIL_MAX_REQUESTS} requests per hour limit for resending emails.`
);

// AI Metadata - Global rate limit (per IP, per minute)
// Acts as a safety net to stay within Gemini API quota (30 RPM)
export const aiMetadataGlobalRateLimiter = createRateLimiter(
  AI_METADATA_GLOBAL_MAX_REQUESTS,
  "The AI service is currently experiencing high demand. Please try again in a moment.",
  { window: "1m" }
);

// AI Metadata - Per-user rate limit (per authenticated user ID, per minute)
// Ensures fair usage across authenticated users
export const aiMetadataPerUserRateLimiter = createRateLimiter(
  AI_METADATA_PER_USER_MAX_REQUESTS,
  "You have exceeded your per-minute AI usage limit. Please wait a moment before trying again.",
  { window: "1m", perUser: true }
);
