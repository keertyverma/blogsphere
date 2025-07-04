import { ApiError, Type } from "@google/genai";
import Joi from "joi";
import { BlogMetadata } from "../../types";
import { buildGeminiConfig, getAIClient } from "./aiClient";

/**
 * Generates SEO-friendly blog metadata (title, summary, tags) using Gemini 2.0 Flash Lite.
 * @param blogText - Clean, meaningful text extracted from blog content blocks — excluding code, images, and other non-textual elements.
 * @returns Parsed AI-generated metadata as { title, summary, tags }
 * @throws If AI response cannot be parsed into valid JSON
 */
export const generateBlogMetadataWithAI = async (
  blogText: string
): Promise<BlogMetadata> => {
  if (!blogText) {
    throw new Error(
      "NO_BLOG_TEXT: blogText is required but was empty or not provided."
    );
  }

  const model = "gemini-2.0-flash-lite";

  // Define structured schema for AI output
  const schema = {
    type: Type.OBJECT,
    description: "Return summary of the blog post",
    properties: {
      title: {
        type: Type.STRING,
        description: "title of the blog post",
      },
      summary: {
        type: Type.STRING,
        description: "summary of the blog post",
      },
      tags: {
        type: Type.ARRAY,
        description: "Relevant tags (keywords)",
        items: { type: Type.STRING },
      },
    },
  };
  const config = buildGeminiConfig({ schema });

  // Build prompt in Gemini's chat format: an array of messages with `role` and `parts`.
  // Here, we send a single user message with plain text.
  const prompt = buildPrompt(blogText);
  const contents = [
    {
      role: "user",
      parts: [{ text: prompt }],
    },
  ];

  try {
    const response = await getAIClient().models.generateContent({
      model,
      config,
      contents,
    });
    const blogMetadata = parseAIResponseJSON(response.text);

    // Validate the structure and required fields of the AI-generated blog metadata
    const { error, value: validatedBlogMetadata } =
      validateBlogMetadata(blogMetadata);
    if (error) throw new Error(`VALIDATION_ERROR: ${error.details[0].message}`);

    return validatedBlogMetadata;
  } catch (error: any) {
    const message = typeof error.message === "string" ? error.message : "";

    if (message.startsWith("GEMINI_API_ERROR")) {
      throw error;
    }

    if (error instanceof ApiError) {
      const { status, message } = error;
      throw new Error(`GEMINI_API_ERROR: ${status} - ${message}.`);
    }

    if (message.startsWith("INVALID_AI_RESPONSE")) {
      throw error;
    }

    if (message.startsWith("VALIDATION_ERROR")) {
      throw new Error(
        "INVALID_AI_RESPONSE: AI response was incomplete or invalid."
      );
    }

    // Fallback for unknown errors
    throw new Error(
      "UNHANDLED_AI_ERROR: An unexpected error occurred during AI metadata generation."
    );
  }
};

const validateBlogMetadata = (metadata: any) => {
  const schema = Joi.object({
    title: Joi.string().trim().min(10).required(),
    summary: Joi.string().trim().min(20).required(),
    tags: Joi.array()
      .items(Joi.string().trim().min(1))
      .min(1)
      .max(5)
      .required(),
  });

  return schema.validate(metadata);
};

const buildPrompt = (text: string) => `
  You are an expert content analyzer tasked with extracting key metadata from blog posts.
  Generate a concise summary, a compelling title, and relevant SEO-friendly tags for the provided blog content.

  Instructions:
  1. Title: Must be at least 10 characters long.
  2. Summary: Must be a single sentence between 20 and 200 characters. This is a hard limit — do not exceed 200 characters under any circumstance.
  3. Tags: Generate 3 to 5 tags. Each tag must be lowercase, hyphen-separated (kebab-case if multi-word), and highly relevant to the content. Exclude emojis.
  Blog post: "${text}"
`;

const parseAIResponseJSON = (responseText: string | undefined): any => {
  try {
    return JSON.parse(responseText || "");
  } catch (error) {
    throw new Error(
      "INVALID_AI_RESPONSE: Failed to parse AI response as JSON."
    );
  }
};
