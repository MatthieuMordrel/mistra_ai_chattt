"use server";
import { ConversationService } from "@/db/services/conversation-service";
import { auth } from "@/lib/auth";
import { ChatMessage } from "@/types/types";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

/**
 * Creates a new conversation
 */
export async function createConversation(
  title: string,
  messages: ChatMessage[] = [],
) {
  // Get the session using cookies
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    // Create a new conversation
    const conversationId = await ConversationService.createConversationInDB(
      session.user.id,
      title,
    );

    // Save messages if provided
    if (messages.length > 0) {
      await ConversationService.saveMessages(conversationId, messages);
    }

    // Revalidate the conversations path to update the UI
    // revalidatePath("/dashboard/chat");

    return { id: conversationId };
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw new Error("Failed to create conversation");
  }
}

/**
 * Updates a conversation's title
 */
export async function updateConversationTitle(
  conversationId: string,
  title: string,
) {
  // Get the session using cookies
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    await ConversationService.updateConversationTitle(
      conversationId,
      session.user.id,
      title,
    );

    // Revalidate the conversations path to update the UI
    revalidatePath("/dashboard/chat");

    return { success: true };
  } catch (error) {
    console.error("Error updating conversation title:", error);
    throw new Error("Failed to update conversation title");
  }
}

/**
 * Saves messages to a conversation
 */
export async function saveMessages(
  conversationId: string,
  messages: ChatMessage[],
) {
  // Get the session using cookies
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify the user owns the conversation
    const conversationData = await ConversationService.getConversation(
      conversationId,
      session.user.id,
    );

    if (!conversationData) {
      throw new Error("Conversation not found");
    }

    // Save the messages
    await ConversationService.saveMessages(conversationId, messages);

    return { success: true };
  } catch (error) {
    console.error("Error saving messages:", error);
    throw new Error("Failed to save messages");
  }
}

/**
 * Deletes a conversation
 */
export async function deleteConversation(conversationId: string) {
  // Get the session using cookies
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    await ConversationService.deleteConversation(
      conversationId,
      session.user.id,
    );

    // Revalidate the conversations path to update the UI
    revalidatePath("/dashboard/chat");

    return { success: true };
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw new Error("Failed to delete conversation");
  }
}
