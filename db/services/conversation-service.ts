import "server-only";

import { db } from "@/db/database";
import { conversation, message } from "@/db/schema/chat-schema";
import { ChatMessage } from "@/types/types";
import { and, desc, eq } from "drizzle-orm";

/**
 * Service for handling database operations related to conversations and messages
 */
export const conversationService = {
  queries: {
    /**
     * Get a conversation by ID including messages and set isStreaming to false
     */
    getConversation: async (conversationId: string, userId: string) => {
      // Fetch conversation and messages in parallel
      const [conversationResult, messages] = await Promise.all([
        db
          .select()
          .from(conversation)
          .where(
            and(
              eq(conversation.id, conversationId),
              eq(conversation.userId, userId),
            ),
          ),
        db
          .select()
          .from(message)
          .where(eq(message.conversationId, conversationId))
          .orderBy(message.createdAt),
      ]);

      const [conversationData] = conversationResult;

      if (!conversationData) {
        throw new Error("Conversation not found");
      }

      return {
        ...conversationData,
        messages: messages.map((msg) => ({
          ...msg,
          isStreaming: false,
        })),
      };
    },

    /**
     * Get all conversations for a user
     */
    getUserConversations: async (userId: string) => {
      const conversations = await db
        .select({
          id: conversation.id,
          title: conversation.title,
          updatedAt: conversation.updatedAt,
        })
        .from(conversation)
        .where(eq(conversation.userId, userId))
        .orderBy(desc(conversation.updatedAt));

      return conversations.map((conv) => ({
        ...conv,
        updatedAt: conv.updatedAt.toISOString(),
      }));
    },

    /**
     * Calculate the total tokens used in a conversation
     */
    getConversationTokens: async (conversationId: string) => {
      const result = await db
        .select({ sum: message.tokens })
        .from(message)
        .where(eq(message.conversationId, conversationId));

      // Sum might be null if there are no messages or no token counts
      return result[0]?.sum || 0;
    },
  },

  mutations: {
    /**
     * Create a new conversation in the database
     */
    createConversation: async (
      userId: string,
      title: string = "New Conversation",
    ) => {
      const result = await db
        .insert(conversation)
        .values({
          userId,
          title,
        })
        .returning({ id: conversation.id });

      if (!result[0]) {
        throw new Error("Failed to create conversation");
      }

      return result[0].id;
    },

    /**
     * Save a message to the database
     */
    saveMessage: async (
      conversationId: string,
      role: "user" | "assistant" | "system",
      content: string,
      tokens?: number,
    ) => {
      const result = await db
        .insert(message)
        .values({
          conversationId,
          role,
          content,
          tokens,
        })
        .returning({ id: message.id });

      if (!result[0]) {
        throw new Error("Failed to save message");
      }

      // Update the conversation's updatedAt timestamp
      await db
        .update(conversation)
        .set({ updatedAt: new Date() })
        .where(eq(conversation.id, conversationId));

      return result[0].id;
    },

    /**
     * Save multiple messages to the database
     */
    saveMessages: async (conversationId: string, messages: ChatMessage[]) => {
      if (!messages.length) return [];

      const messageIds: string[] = [];

      // Insert each message individually to get the IDs
      for (const msg of messages) {
        const id = await conversationService.mutations.saveMessage(
          conversationId,
          msg.role,
          msg.content,
          undefined, // We don't have token counts in the ChatMessage type
        );
        messageIds.push(id);
      }

      return messageIds;
    },

    /**
     * Update a conversation's title
     */
    updateConversationTitle: async (
      conversationId: string,
      userId: string,
      title: string,
    ) => {
      await db
        .update(conversation)
        .set({ title, updatedAt: new Date() })
        .where(
          and(
            eq(conversation.id, conversationId),
            eq(conversation.userId, userId),
          ),
        );
    },

    /**
     * Delete a conversation and all its messages
     */
    deleteConversation: async (conversationId: string, userId: string) => {
      await db
        .delete(conversation)
        .where(
          and(
            eq(conversation.id, conversationId),
            eq(conversation.userId, userId),
          ),
        );
      // Messages will be deleted automatically due to the CASCADE constraint
    },
  },
};
