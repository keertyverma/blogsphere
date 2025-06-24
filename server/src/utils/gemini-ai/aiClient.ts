import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";
import config from "config";

/**
 * Default configuration for Gemini API content generation.
 * - Sets moderate safety thresholds to block harmful content.
 * - Specifies JSON response format (used for schema-based generation).
 */
const defaultGeminiConfig = {
  topK: 64,
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, // Block most
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, // Block most
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, // Block most
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, // Block most
    },
  ],
  responseMimeType: "application/json",
};

interface GeminiConfigOptions {
  schema?: Record<string, any>; // response schema for structured JSON output
  overrides?: Record<string, any>; // to override default config (e.g., topK, responseMimeType etc.)
}

/**
 * Builds a Gemini configuration object by merging:
 * - the default config
 * - an optional response schema
 * - any override values
 */
export function buildGeminiConfig({
  schema,
  overrides = {},
}: GeminiConfigOptions = {}) {
  return {
    ...defaultGeminiConfig,
    ...(schema && { responseSchema: schema }),
    ...overrides,
  };
}

// Gemini client instance for AI content generation
export const ai = new GoogleGenAI({
  apiKey: config.get("geminiApiKey"),
});
