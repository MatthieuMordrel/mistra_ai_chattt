"use server";
import { DAL } from "@/db/dal";
import { cachedValidateServerSession } from "@/lib/auth/validateSession";
import { MAX_USER_MESSAGES } from "@/lib/auth/verificationFunction";
import { tryCatch } from "@/lib/tryCatch";
import { messagesSchema } from "@/lib/validation/schemas";
import { ChatMessage } from "@/types/types";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Checks if the user has reached their message limit
 * @param userId - The user's ID
 * @param newUserMessagesCount - Number of new user messages to be added
 * @returns Object with hasReachedLimit boolean and current message count
 */
async function checkMessageLimit(
  userId: string,
  newUserMessagesCount: number = 0,
) {
  const { data: currentCount, error } = await tryCatch(
    DAL.conversation.queries.getUserMessageCount(userId),
  );

  if (error) {
    throw new Error("Failed to check message limit");
  }

  return {
    hasReachedLimit: currentCount + newUserMessagesCount > MAX_USER_MESSAGES,
    currentCount,
    remainingMessages: Math.max(0, MAX_USER_MESSAGES - currentCount),
  };
}

/**
 * Creates a new conversation in the database and returns the conversation id
 */
export async function createConversationAction(
  title: string,
  messages: ChatMessage[] = [],
) {
  // Get the session using cookies
  const { session } = await cachedValidateServerSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Count user messages in the new messages
  const newUserMessagesCount = messages.filter(
    (msg) => msg.role === "user",
  ).length;

  // Check message limit before creating conversation
  const { hasReachedLimit, remainingMessages } = await checkMessageLimit(
    session.user.id,
    newUserMessagesCount,
  );

  if (hasReachedLimit) {
    throw new Error(
      `Message limit reached. You have ${remainingMessages} messages remaining out of ${MAX_USER_MESSAGES}.`,
    );
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
  const { session } = await cachedValidateServerSession();

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
  const { session } = await cachedValidateServerSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Validate messages
  const { error: validationError } = messagesSchema.safeParse(messages);

  if (validationError) {
    if (validationError instanceof z.ZodError) {
      const firstError = validationError.errors[0];
      if (firstError) {
        throw new Error(`Invalid message format: ${firstError.message}`);
      }
    }
    throw validationError;
  }

  // Count user messages in the new messages
  const newUserMessagesCount = messages.filter(
    (msg) => msg.role === "user",
  ).length;

  // Check message limit before saving
  const { hasReachedLimit, remainingMessages } = await checkMessageLimit(
    session.user.id,
    newUserMessagesCount,
  );

  if (hasReachedLimit) {
    throw new Error(
      `Message limit reached. You have ${remainingMessages} messages remaining out of ${MAX_USER_MESSAGES}.`,
    );
  }

  // Verify the user owns the conversation
  const { data: conversationData, error: conversationError } = await tryCatch(
    DAL.conversation.queries.getConversationMessages(
      conversationId,
      session.user.id,
    )(),
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
  const { session } = await cachedValidateServerSession();

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
