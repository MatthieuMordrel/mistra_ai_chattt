import { StreamChunk } from "./types";

/**
 * Extracts content from a StreamChunk if available
 * @param chunk The parsed StreamChunk
 * @returns The content string or null if no content is available
 */
export function extractContentFromChunk(chunk: StreamChunk): string | null {
  // Check if we have choices and delta content
  if (!chunk.choices || !chunk.choices[0] || !chunk.choices[0].delta) {
    return null;
  }

  const delta = chunk.choices[0].delta;

  // Handle string content
  if (typeof delta.content === "string") {
    return delta.content;
  }

  // Handle content array (for multi-modal responses)
  if (Array.isArray(delta.content)) {
    return delta.content
      .map((item) => ("text" in item ? item.text : ""))
      .join("");
  }

  return null;
}
