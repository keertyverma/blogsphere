import { ApiError, Type } from "@google/genai";
import { BlogMetadata, EditorJsBlock } from "../../types";
import { ai, buildGeminiConfig } from "./aiClient";

/**
 * Generates SEO-friendly blog metadata (title, summary, tags) using Gemini 2.0 Flash Lite.
 * @param blogContent Editor.js block data from the blog
 * @returns Parsed AI-generated metadata as { title, summary, tags }
 * @throws If AI response cannot be parsed into valid JSON
 */
export const generateBlogMetadataWithAI = async (blogContent: {
  blocks: EditorJsBlock[];
}): Promise<BlogMetadata> => {
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
        description: "Relevant tags (3-5 keywords)",
        items: { type: Type.STRING },
      },
    },
  };
  const config = buildGeminiConfig({ schema });

  // Convert structured Editor.js blocks to plain text
  const blogText = convertEditorJsToText(blogContent.blocks);

  // Build prompt in Gemini's chat format: an array of messages with `role` and `parts`.
  // Here, we send a single user message with plain text.
  const prompt = `Generate a short summary (max 200 characters), a title, and 3 to 5 lowercase, SEO-friendly tags based on the blog content. Do not include emojis. Return a valid JSON.
  Blog post: "${blogText}"`;
  const contents = [
    {
      role: "user",
      parts: [{ text: prompt }],
    },
  ];

  try {
    const response = await ai.models.generateContent({
      model,
      config,
      contents,
    });

    const blogMetadata = JSON.parse(response.text || "") as BlogMetadata;
    return blogMetadata;
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      throw new Error(
        "Failed to parse AI response. The returned data is not valid JSON."
      );
    }

    if (error instanceof ApiError) {
      const { status, message } = error;
      throw new Error(`Gemini API error - [${status}]: ${message}`);
    }

    // Fallback for unknown errors
    throw new Error(
      "An unexpected error occurred during AI metadata generation."
    );
  }
};

/**
 * Converts an array of Editor.js blocks to plain, structured text.
 * Used for generating blog metadata (title, summary, tags) with AI.
 *
 * Only includes semantic content types: header, paragraph, quote, and list.
 * Ignores visual or non-informative blocks like code, image, divider, etc.
 *
 * @param blocks - Array of Editor.js content blocks
 * @returns Plain text string for AI consumption
 */
export const convertEditorJsToText = (blocks: EditorJsBlock[]): string => {
  return blocks
    .map((block) => {
      const { type, data } = block;
      switch (type) {
        case "header":
          // Include heading level (e.g., #, ##) to preserve content structure and hierarchy,
          // which helps the AI better understand the importance of each section.
          if (!data.text?.trim()) return "";
          return `${"#".repeat(data.level)} ${data.text}`;
        case "paragraph":
          return data.text?.trim() || "";
        case "quote":
          return data.text?.trim() || "";
        case "list":
          return renderNestedList(data.items || []);
        default:
          return ""; // Ignore all other block types (e.g., code, image, divider)
      }
    })
    .filter(Boolean) // Remove empty or invalid blocks
    .join("\n");
};

/**
 * Recursively renders nested list items from Editor.js-style blocks into plain text.
 * Skips empty items and formats with indentation for nesting.
 *
 * @param items - The list items array from Editor.js block
 * @param level - The current nesting level (used for indentation)
 * @returns A formatted plain-text string representing the list
 */
const renderNestedList = (items: any[], level = 0): string => {
  const indent = " ".repeat(level * 2);

  return items
    .filter((item) => item.content?.trim()) // Skip empty list items
    .map((item) => {
      const line = `${indent}- ${item.content.trim()}`;
      const nested = item.items?.length
        ? `\n${renderNestedList(item.items, level + 1)}`
        : "";
      return `${line}${nested}`;
    })
    .join("\n");
};
