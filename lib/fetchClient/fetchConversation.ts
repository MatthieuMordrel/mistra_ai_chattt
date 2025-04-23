import { z } from "zod";

const MessagesSchema = z.array(
  z.object({
    content: z.string(),
    conversationId: z.string(),
    createdAt: z.string(),
    id: z.string(),
    role: z.enum(["user", "assistant"]),
    tokens: z.number().nullable(),
    isStreaming: z.boolean(),
  }),
);

export type MessagesFromSchema = z.infer<typeof MessagesSchema>;

// API function to fetch conversations
export async function fetchConversation(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const response = await fetch(`${baseUrl}/api/messages/${id}`, {
    cache: "no-store",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch messages pouet");
  }

  const data = await response.json();
  // Parse the data with zod, if it fails, throw a ZodError
  const parsedData = MessagesSchema.parse(data);
  return parsedData;
}
