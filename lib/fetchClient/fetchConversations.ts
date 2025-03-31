import { Conversation } from "@/types/types";

// API function to fetch conversations
export async function fetchConversations() {
  const response = await fetch("/api/conversations");
  if (!response.ok) {
    throw new Error("Failed to fetch conversations");
  }
  const data: Conversation[] = await response.json();
  return data;
}
