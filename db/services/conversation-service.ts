import { db } from "@/db/database";
import { conversation, message } from "@/db/schema/chat-schema";
import { ChatMessage } from "@/types/types";
import { and, desc, eq } from "drizzle-orm";

/**
 * Service for handling database operations related to conversations and messages
 */
export class ConversationService {
  /**
   * Create a new conversation in the database
   * @param userId The ID of the user who owns the conversation
   * @param title The title of the conversation
   * @returns The ID of the newly created conversation
   */
  static async createConversationInDB(
    userId: string,
    title: string = "New Conversation",
  ): Promise<string> {
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
  }

  /**
   * Save a message to the database
   * @param conversationId The ID of the conversation the message belongs to
   * @param role The role of the message sender ('user' or 'assistant')
   * @param content The content of the message
   * @param tokens Optional token count for tracking usage
   * @returns The ID of the newly created message
   */
  static async saveMessage(
    conversationId: string,
    role: "user" | "assistant" | "system",
    content: string,
    tokens?: number,
  ): Promise<string> {
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
  }

  /**
   * Save multiple messages to the database
   * @param conversationId The ID of the conversation the messages belong to
   * @param messages The messages to save
   * @returns The IDs of the newly created messages
   */
  static async saveMessages(
    conversationId: string,
    messages: ChatMessage[],
  ): Promise<string[]> {
    if (!messages.length) return [];

    const messageIds: string[] = [];

    // Insert each message individually to get the IDs
    for (const msg of messages) {
      const id = await this.saveMessage(
        conversationId,
        msg.role,
        msg.content,
        undefined, // We don't have token counts in the ChatMessage type, we'll need to calculate this at some point
      );
      messageIds.push(id);
    }

    return messageIds;
  }

  /**
   * Get a conversation by ID including messages and set isStreaming to false
   * @param conversationId The ID of the conversation to get
   * @param userId The ID of the user who owns the conversation
   * @returns The conversation and its messages
   */
  static async getConversation(conversationId: string, userId: string) {
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
  }

  /**
   * Get all conversations for a user
   * @param userId The ID of the user
   * @returns An array of conversations
   */
  static async getUserConversations(userId: string) {
    return db
      .select()
      .from(conversation)
      .where(eq(conversation.userId, userId))
      .orderBy(desc(conversation.updatedAt));
  }

  /**
   * Update a conversation's title
   * @param conversationId The ID of the conversation to update
   * @param userId The ID of the user who owns the conversation
   * @param title The new title for the conversation
   */
  static async updateConversationTitle(
    conversationId: string,
    userId: string,
    title: string,
  ) {
    await db
      .update(conversation)
      .set({ title, updatedAt: new Date() })
      .where(
        and(
          eq(conversation.id, conversationId),
          eq(conversation.userId, userId),
        ),
      );
  }

  /**
   * Delete a conversation and all its messages
   * @param conversationId The ID of the conversation to delete
   * @param userId The ID of the user who owns the conversation
   */
  static async deleteConversation(conversationId: string, userId: string) {
    await db
      .delete(conversation)
      .where(
        and(
          eq(conversation.id, conversationId),
          eq(conversation.userId, userId),
        ),
      );
    // Messages will be deleted automatically due to the CASCADE constraint
  }

  /**
   * Calculate the total tokens used in a conversation
   * @param conversationId The ID of the conversation
   * @returns The total number of tokens used
   */
  static async getConversationTokens(conversationId: string): Promise<number> {
    const result = await db
      .select({ sum: message.tokens })
      .from(message)
      .where(eq(message.conversationId, conversationId));

    // Sum might be null if there are no messages or no token counts
    return result[0]?.sum || 0;
  }
}
