import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
/**
 * Merges multiple class names together using the `clsx` and `tailwind-merge` libraries.
 * This function takes an arbitrary number of arguments, each representing a class name or an array of class names.
 * It first combines all the arguments using `clsx`, which handles conditional classes and ensures proper formatting.
 * Then, it passes the combined class names to `twMerge` from the `tailwind-merge` library, which merges the Tailwind CSS classes and removes any duplicates.
 *
 * @param inputs - An arbitrary number of arguments representing class names or arrays of class names.
 * @returns The merged and deduplicated class names as a string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a conversation title to ensure it's not too long and is properly formatted
 *
 * @param title - The original title text, typically from the first user message
 * @param options - Configuration options for formatting
 * @returns A properly formatted and truncated title
 */
export function formatConversationTitle(
  title: string,
  options: {
    maxLength?: number;
    ellipsis?: string;
    removeNewlines?: boolean;
    trim?: boolean;
  } = {},
): string {
  const {
    maxLength = 30,
    ellipsis = "...",
    removeNewlines = true,
    trim = true,
  } = options;

  // Handle empty or undefined titles
  if (!title) {
    return "New Conversation";
  }

  let formattedTitle = title;

  // Remove newlines if specified
  if (removeNewlines) {
    formattedTitle = formattedTitle.replace(/\n/g, " ");
  }

  // Trim whitespace if specified
  if (trim) {
    formattedTitle = formattedTitle.trim();
  }

  // Truncate if longer than maxLength
  if (formattedTitle.length > maxLength) {
    formattedTitle = formattedTitle.substring(0, maxLength) + ellipsis;
  }

  return formattedTitle;
}
