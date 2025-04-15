import { z } from "zod";

const conversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  updatedAt: z.string(),
});

export type ConversationFromSchema = z.infer<typeof conversationSchema>;

// API function to fetch conversations
export async function fetchConversations() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
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

  const data = await response.json();
  // Parse the data with zod, if it fails, throw a ZodError
  const parsedData = conversationSchema.array().parse(data);
  return parsedData;
}
