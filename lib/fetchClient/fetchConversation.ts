import { z } from "zod";

const conversationWithMessagesSchema = z.object({
  createdAt: z.string(),
  id: z.string(),
  title: z.string(),
  updatedAt: z.string(),
  userId: z.string(),
  messages: z.array(
    z.object({
      content: z.string(),
      conversationId: z.string(),
      createdAt: z.string(),
      id: z.string(),
      isStreaming: z.boolean(),
      role: z.enum(["user", "assistant"]),
      tokens: z.number().nullable(),
    }),
  ),
});

export type ConversationWithMessagesFromSchema = z.infer<
  typeof conversationWithMessagesSchema
>;

// API function to fetch conversations
export async function fetchConversation(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const response = await fetch(`${baseUrl}/api/conversations/${id}`, {
    cache: "no-store",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch conversations pouet");
  }

  const data = await response.json();
  console.log("data", data);
  // Parse the data with zod, if it fails, throw a ZodError
  const parsedData = conversationWithMessagesSchema.parse(data);
  return parsedData;
}
