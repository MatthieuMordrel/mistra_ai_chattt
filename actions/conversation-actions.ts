"use server";
import { DAL } from "@/db/dal";
import { cachedValidateServerSession } from "@/lib/auth/validateSession";
import { tryCatch } from "@/lib/tryCatch";
import { ChatMessage } from "@/types/types";
import { revalidatePath } from "next/cache";

/**
 * Creates a new conversation in the database and returns the conversation id
 */
export async function createConversationAction(
  title: string,
  messages: ChatMessage[] = [],
) {
  // Get the session using cookies
  const result = await cachedValidateServerSession();
  const session = result.session;

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Create a new conversation
  const { data: conversationId, error } = await tryCatch(
    DAL.conversation.mutations.createConversation(
      session.session.userId,
      title,
    ),
  );

  if (error) {
    throw new Error("Failed to create conversation");
  }

  // Save messages if provided
  if (messages.length > 0) {
    const { error: saveMessagesError } = await tryCatch(
      DAL.conversation.mutations.saveMessages(conversationId, messages),
    );
    if (saveMessagesError) {
      throw new Error("Failed to save messages");
    }
  }

  // Revalidate the conversations path to update the UI
  // revalidatePath("/dashboard/chat");

  return { id: conversationId };
}

/**
 * Updates a conversation's title in the database
 */
export async function updateConversationTitle(
  conversationId: string,
  title: string,
) {
  // Get the session using cookies
  const result = await cachedValidateServerSession();
  const session = result.session;

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const { error } = await tryCatch(
    DAL.conversation.mutations.updateConversationTitle(
      conversationId,
      session.user.id,
      title,
    ),
  );

  if (error) {
    throw new Error("Failed to update conversation title");
  }

  // Revalidate the conversations path to update the UI
  // revalidatePath("/dashboard/chat");

  return { success: true };
}

/**
 * Saves messages to a conversation in the database
 * This function can handle both user and assistant messages
 */
export async function saveMessagesAction(
  conversationId: string,
  messages: ChatMessage[],
) {
  // Get the session using cookies
  const result = await cachedValidateServerSession();
  const session = result.session;

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify the user owns the conversation
  const { data: conversationData, error: conversationError } = await tryCatch(
    DAL.conversation.queries.getConversation(conversationId, session.user.id),
  );

  if (conversationError) {
    throw new Error("Conversation not found");
  }

  // Save the messages
  const { error: saveMessagesError } = await tryCatch(
    DAL.conversation.mutations.saveMessages(conversationId, messages),
  );

  if (saveMessagesError) {
    throw new Error("Failed to save messages");
  }

  // Revalidate the conversation path to update the UI if needed
  // revalidatePath(`/dashboard/chat/${conversationId}`);

  return { success: true };
}

/**
 * Deletes a conversation in the database and returns a sucess boolean or throws an error
 */
export async function deleteConversationAction(conversationId: string) {
  // Get the session using cookies
  const result = await cachedValidateServerSession();
  const session = result.session;

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const { error: deleteConversationError } = await tryCatch(
    DAL.conversation.mutations.deleteConversation(
      conversationId,
      session.user.id,
    ),
  );

  if (deleteConversationError) {
    throw new Error("Failed to delete conversation");
  }

  // Revalidate the conversations path to update the UI
  // revalidatePath("/dashboard/chat");

  return { success: true };
}

/**
 * Revalidates the conversations path to update the UI
 */
export async function revalidateConversations(id: string) {
  // Revalidate the conversations path to update the UI
  //This empty the route cache for all conversations because the route is dynamic
  revalidatePath(`/dashboard/chat/${id}`);
}
