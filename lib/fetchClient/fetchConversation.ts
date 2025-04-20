import { z } from "zod";

const conversationWithMessagesSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  updatedAt: z.string(),
  createdAt: z.string(),
  messages: z.array(
    z.object({
      id: z.string(),
      conversationId: z.string(),
      isStreaming: z.boolean(),
      content: z.string(),
      role: z.enum(["user", "assistant"]),
      tokens: z.number().nullable(),
      createdAt: z.string(),
    }),
  ),
});

export type ConversationWithMessagesFromSchema = z.infer<
  typeof conversationWithMessagesSchema
>;

// API function to fetch conversations
export async function fetchConversation(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const response = await fetch(`${baseUrl}/api/conversation/${id}`, {
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
  // Parse the data with zod, if it fails, throw a ZodError
  const parsedData = conversationWithMessagesSchema.parse(data);
  return parsedData;
}
