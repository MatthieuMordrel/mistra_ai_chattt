export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}
// API function to fetch conversations
export async function fetchConversations() {
  const response = await fetch("/api/conversations");
  if (!response.ok) {
    throw new Error("Failed to fetch conversations");
  }
  return response.json() as Promise<Conversation[]>;
}
