import { saveMessagesAction } from "@/actions/conversation-actions";
import {
  MessagesFromSchema,
  fetchConversation,
} from "@/lib/fetchClient/fetchConversation";
import { streamMistralClient } from "@/lib/mistral streaming/mistral-client";
import { ChatMessage } from "@/types/types";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

/**
 * Hook to fetch and manage a specific conversation with its messages
 * @param id The conversation ID
 * @returns The conversation data with messages and mutations
 */
export function useConversationDetails(id?: string) {
  const queryClient = useQueryClient();

  // Fetch conversation with messages
  const conversationQuery = useSuspenseQuery({
    queryKey: ["conversation", id],
    queryFn: () => (id ? fetchConversation(id) : []),
    refetchOnMount: false,
  });

  // Mutation for saving messages to a conversation with optimistic updates
  const saveMessagesMutation = useMutation({
    mutationFn: async (
      messages: ChatMessage[],
    ): Promise<{ success: boolean }> => {
      if (!id) {
        throw new Error("Conversation ID is required");
      }
      const result = await saveMessagesAction(id, messages);
      return result;
    },
    // Optimistically update the UI
    onMutate: async (newMessages) => {
      if (!id) {
        throw new Error("Conversation ID is required");
      }
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["conversation", id] });

      // Snapshot the previous value (now an array of messages)
      const previousMessages = queryClient.getQueryData<MessagesFromSchema>([
        "conversation",
        id,
      ]);

      // Ensure previousMessages is an array
      const safePreviousMessages = Array.isArray(previousMessages)
        ? previousMessages
        : [];

      // Create new messages array with the new messages added
      const updatedMessages = [
        ...safePreviousMessages,
        ...newMessages
          .filter((msg) => msg.role === "user" || msg.role === "assistant")
          .map((msg) => ({
            id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            conversationId: id,
            isStreaming: false,
            content: msg.content,
            role: msg.role as "user" | "assistant",
            tokens: null,
            createdAt: new Date().toISOString(),
          })),
      ];

      // Optimistically update the cache
      queryClient.setQueryData<MessagesFromSchema>(
        ["conversation", id],
        updatedMessages,
      );

      return { previousMessages: safePreviousMessages };
    },

    // If the mutation fails, roll back
    onError: (err, newMessages, context) => {
      console.log("saveMessagesMutation: onError", err);
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["conversation", id],
          Array.isArray(context.previousMessages)
            ? context.previousMessages
            : [],
        );
      }
    },

    // After success or error, invalidate the queries to refetch
    onSettled: () => {
      console.log("saveMessagesMutation: onSettled");
      queryClient.invalidateQueries({ queryKey: ["conversation", id] });
      // Also invalidate the conversations list since updatedAt might have changed
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Mutation for streaming assistant responses
  const streamAndSaveMessageMutation = useMutation({
    mutationFn: async ({
      messages,
      modelId,
      conversationId = id,
      tempMessageId,
    }: {
      messages: ChatMessage[];
      modelId?: string;
      conversationId?: string;
      tempMessageId: string;
    }) => {
      if (!conversationId) {
        throw new Error("Conversation ID is required");
      }

      let accumulatedContent = "";
      let finalContent = "";

      // First, stream the content with callbacks
      await streamMistralClient({
        model: modelId || "mistral-small-latest",
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        callbacks: {
          onToken: (token) => {
            // Accumulate content
            accumulatedContent += token;

            // Update query cache with streaming content
            queryClient.setQueryData(
              ["conversation", conversationId],
              (oldData?: MessagesFromSchema) => {
                if (!oldData) return [];

                // Ensure oldData is an array
                const safeOldData = Array.isArray(oldData) ? oldData : [];

                // Find and update the streaming message
                const updatedMessages = [...safeOldData];
                const streamingMsgIndex = updatedMessages.findIndex(
                  (msg) => msg.id === tempMessageId,
                );

                if (
                  streamingMsgIndex >= 0 &&
                  updatedMessages[streamingMsgIndex]
                ) {
                  const currentMsg = updatedMessages[streamingMsgIndex];
                  updatedMessages[streamingMsgIndex] = {
                    ...currentMsg,
                    content: accumulatedContent,
                    conversationId: currentMsg.conversationId,
                    id: currentMsg.id,
                    role: currentMsg.role,
                    tokens: currentMsg.tokens,
                    createdAt: currentMsg.createdAt,
                    isStreaming: true,
                  };
                }

                return updatedMessages;
              },
            );
          },
          onComplete: async (content) => {
            // Store final content to use later
            finalContent = content;
          },
          onError: (error) => {
            console.error("Error streaming response:", error);

            // Update message with error indicator
            queryClient.setQueryData(
              ["conversation", conversationId],
              (oldData?: MessagesFromSchema) => {
                if (!oldData) return [];

                // Ensure oldData is an array
                const safeOldData = Array.isArray(oldData) ? oldData : [];

                const updatedMessages = [...safeOldData];
                const streamingMsgIndex = updatedMessages.findIndex(
                  (msg) => msg.id === tempMessageId,
                );

                if (
                  streamingMsgIndex >= 0 &&
                  updatedMessages[streamingMsgIndex]
                ) {
                  const currentMsg = updatedMessages[streamingMsgIndex];
                  updatedMessages[streamingMsgIndex] = {
                    ...currentMsg,
                    content:
                      "Sorry, there was an error generating a response. Please try again.",
                    conversationId: currentMsg.conversationId,
                    id: currentMsg.id,
                    role: currentMsg.role,
                    tokens: currentMsg.tokens,
                    createdAt: currentMsg.createdAt,
                  };
                }

                return updatedMessages;
              },
            );
          },
        },
      });

      // After streaming completes successfully, save to database
      if (!finalContent) {
        throw new Error("No content generated");
      }

      // This will be executed BEFORE onSuccess is called
      const { success } = await saveMessagesAction(conversationId, [
        { role: "assistant", content: finalContent },
      ]);

      if (!success) {
        throw new Error("Failed to save messages");
      }
      console.log("success?", success);

      return { success, finalContent };
    },
    onSuccess: () => {
      console.log("streamAndSaveMessageMutation: onSuccess");
      // Now we can safely invalidate the queries after the mutation is complete
      queryClient.invalidateQueries({
        queryKey: ["conversation", id],
      });
      // Invalidate the conversation list to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error, variables, context) => {
      console.error("Error in streaming mutation:", error);
    },
  });

  // Return the conversation messages, mutations and loading states
  return {
    messages: conversationQuery.data,
    ...conversationQuery,
    saveMessages: saveMessagesMutation.mutateAsync,
    isSavingMessages: saveMessagesMutation.isPending,
    streamAndSaveMessage: async (params: {
      messages: ChatMessage[];
      modelId?: string;
      conversationId?: string;
    }) => {
      // Generate a unique ID for the streaming message
      const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const targetId = params.conversationId || id;
      if (targetId) {
        await queryClient.cancelQueries({
          queryKey: ["conversation", targetId],
        });

        // Always ensure we're working with an array when setting the query data
        queryClient.setQueryData(
          ["conversation", targetId],
          (oldData?: MessagesFromSchema) => {
            // Ensure oldData is an array
            const safeOldData = Array.isArray(oldData) ? oldData : [];

            // If we have no data, return a new array with just the assistant message
            if (safeOldData.length === 0) {
              return [
                {
                  id: tempMessageId,
                  conversationId: targetId,
                  role: "assistant",
                  content: "",
                  tokens: null,
                  createdAt: new Date().toISOString(),
                  isStreaming: true,
                },
              ];
            }

            // Otherwise append the new message to the existing array
            return [
              ...safeOldData,
              {
                id: tempMessageId,
                conversationId: targetId,
                role: "assistant",
                content: "",
                tokens: null,
                createdAt: new Date().toISOString(),
                isStreaming: true,
              },
            ];
          },
        );
      }

      // Then run the mutation with the tempMessageId
      return await streamAndSaveMessageMutation.mutateAsync({
        ...params,
        tempMessageId,
      });
    },
  };
}
