/**
 * Client-side tokenizer utility using pure JavaScript
 * No server API calls or binary dependencies required
 */

// Simple regex pattern to roughly estimate tokens
// This is a simplified version that won't match the exact tokenization of models,
// but provides a reasonable estimate for UI purposes
const TOKEN_REGEX = /\p{L}+|\p{N}+|[^\p{Z}\p{L}\p{N}]+|\p{Z}+/gu;

/**
 * Simple tokenizer function that provides reasonable estimates
 * @param text Text to tokenize
 * @returns Array of token strings
 */
export function simpleTokenize(text: string): string[] {
  try {
    // Use Unicode-aware regex for better international text support
    return Array.from(text.matchAll(TOKEN_REGEX), (match) => match[0]);
  } catch (error) {
    // Fallback to simple whitespace splitting if Unicode regex fails
    // (older browsers may not support the Unicode regex features)
    console.warn("Using fallback tokenizer due to regex support issue:", error);
    return text.match(/\S+|\s+/g) || [];
  }
}

/**
 * Count tokens in a text string
 *
 * @param text Text to count tokens for
 * @returns Number of tokens in the text
 */
export async function countTokens(text: string): Promise<number> {
  return simpleTokenize(text).length;
}

/**
 * Count tokens in an array of messages
 *
 * @param messages Array of chat messages with role and content
 * @returns Total token count for all messages
 */
export async function countMessageTokens(
  messages: Array<{ role: string; content: string }>,
): Promise<number> {
  let totalCount = 0;

  for (const message of messages) {
    // Add ~4 tokens per message for role formatting and structure
    totalCount += 4;

    // Count tokens in message content
    totalCount += simpleTokenize(message.content).length;
  }

  return totalCount;
}

/**
 * Estimate token count for streaming chunks - synchronous version
 * for use during streaming when we want immediate results
 *
 * @param text Text chunk to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokenCount(text: string): number {
  if (!text || text.length === 0) return 0;

  // Use the same tokenization method for consistency
  return simpleTokenize(text).length;
}
