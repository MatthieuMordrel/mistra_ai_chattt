import { z } from "zod";

export const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(30000, "Message cannot exceed 30000 characters"),
  isStreaming: z.boolean().optional(),
});

export const messagesSchema = z.array(messageSchema);
