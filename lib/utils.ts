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
