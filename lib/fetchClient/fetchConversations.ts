import { Conversation } from "@/types/types";

// API function to fetch conversations
export async function fetchConversations() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/conversations`, {
    cache: "no-store",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("response", response);
  if (!response.ok) {
    throw new Error("Failed to fetch conversations pouet");
  }
  const data: Conversation[] = await response.json();
  return data;
}
