import { config } from "dotenv";

if (process.env.NODE_ENV !== "test") {
  throw new Error("❌ NODE_ENV must be 'test' when running tests!");
}

// Load .env.test configuration only if NODE_ENV is 'test'
config({ path: ".env.test" });
