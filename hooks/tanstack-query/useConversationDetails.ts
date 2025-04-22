import { saveMessagesAction } from "@/actions/conversation-actions";
import {
  MessagesFromSchema,
  fetchConversation,
} from "@/lib/fetchClient/fetchConversation";
import { streamMistralClient } from "@/lib/mistral streaming/mistral-client";
import { useChatActions } from "@/store/chatStore";
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
  const chatActions = useChatActions();

  // Fetch conversation with messages
  const conversationQuery = useSuspenseQuery({
    queryKey: ["conversation", id],
    queryFn: () => (id ? fetchConversation(id) : []),
  });

  // Mutation for saving messages to a conversation with optimistic updates
  const saveMessagesMutation = useMutation({
    mutationFn: async (
      messages: ChatMessage[],
    ): Promise<{ success: boolean }> => {
      if (!id) {
        throw new Error("Conversation ID is required");
      }
      return saveMessagesAction(id, messages);
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

      if (previousMessages) {
        // Create new messages array with the new messages added
        const updatedMessages = [
          ...previousMessages,
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
      }

      return { previousMessages };
    },

    // If the mutation fails, roll back
    onError: (err, newMessages, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["conversation", id],
          context.previousMessages,
        );
      }
    },

    // After success or error, invalidate the queries to refetch
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation", id] });
      // Also invalidate the conversations list since updatedAt might have changed
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Mutation for streaming assistant responses
  const streamMessageMutation = useMutation({
    mutationFn: async ({
      messages,
      modelId,
    }: {
      messages: ChatMessage[];
      modelId?: string;
    }) => {
      if (!id) {
        throw new Error("Conversation ID is required");
      }

      let accumulatedContent = "";
      const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Set streaming state to true at the start
      chatActions.setStreaming(true);

      return streamMistralClient({
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
              ["conversation", id],
              (oldData?: MessagesFromSchema) => {
                if (!oldData) return oldData;

                // Find and update the streaming message
                const updatedMessages = [...oldData];
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
                  };
                }

                return updatedMessages;
              },
            );
          },
          onComplete: async (fullContent) => {
            // Set streaming state to false on completion
            chatActions.setStreaming(false);

            // Update query cache with final content
            queryClient.setQueryData(
              ["conversation", id],
              (oldData?: MessagesFromSchema) => {
                if (!oldData) return oldData;

                const updatedMessages = [...oldData];
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
                    content: fullContent,
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

            // Persist final message to database
            await saveMessagesAction(id, [
              { role: "assistant", content: fullContent },
            ]);

            // Invalidate queries to get fresh data
            queryClient.invalidateQueries({ queryKey: ["conversation", id] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
          },
          onError: (error) => {
            console.error("Error streaming response:", error);
            // Set streaming state to false on error
            chatActions.setStreaming(false);

            // Update message with error indicator
            queryClient.setQueryData(
              ["conversation", id],
              (oldData?: MessagesFromSchema) => {
                if (!oldData) return oldData;

                const updatedMessages = [...oldData];
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
    },
    // Optimistic update to immediately show empty streaming message
    onMutate: async ({ messages }) => {
      if (!id) {
        throw new Error("Conversation ID is required");
      }

      const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["conversation", id] });

      // Snapshot current data
      const previousMessages = queryClient.getQueryData<MessagesFromSchema>([
        "conversation",
        id,
      ]);

      // Add empty assistant message
      queryClient.setQueryData(
        ["conversation", id],
        (oldData?: MessagesFromSchema) => {
          if (!oldData) return oldData;

          return [
            ...oldData,
            {
              id: tempMessageId,
              conversationId: id,
              role: "assistant",
              content: "",
              tokens: null,
              createdAt: new Date().toISOString(),
            },
          ];
        },
      );

      return { previousMessages, tempMessageId };
    },
    onError: (error, variables, context) => {
      // Set streaming state to false on error
      chatActions.setStreaming(false);

      // If streaming fails, restore previous state
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["conversation", id],
          context.previousMessages,
        );
      }
    },
  });

  // Return the conversation messages, mutations and loading states
  return {
    messages: conversationQuery.data,
    ...conversationQuery,
    saveMessages: saveMessagesMutation.mutateAsync,
    isSavingMessages: saveMessagesMutation.isPending,
    streamMessage: streamMessageMutation.mutateAsync,
  };
}
