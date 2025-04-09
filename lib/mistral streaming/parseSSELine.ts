import { StreamChunk } from "./types";

/**
 * Parses an SSE message line and extracts the StreamChunk data
 * @param line A line from the SSE stream (starting with "data: ")
 * @returns Parsed StreamChunk or null if parsing failed or it's a control message
 */
export function parseSSELine(line: string): StreamChunk | null {
  // Skip empty lines or non-data lines
  if (!line.trim() || !line.startsWith("data: ")) {
    return null;
  }

  // Extract the JSON part (removing "data: " prefix)
  const jsonStr = line.substring(6).trim();

  // Handle the special "[DONE]" message
  if (jsonStr === "[DONE]") {
    return null;
  }

  try {
    // Parse and cast to StreamChunk type
    return JSON.parse(jsonStr) as StreamChunk;
  } catch (error) {
    console.error("Error parsing SSE line:", error);
    return null;
  }
}
