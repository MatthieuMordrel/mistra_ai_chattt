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
              ["conversation", conversationId],
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
                    isStreaming: true,
                  };
                }

                return updatedMessages;
              },
            );
          },
          onComplete: async (fullContent) => {
            // Update query cache with final content
            queryClient.setQueryData(
              ["conversation", conversationId],
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
                    isStreaming: false,
                  };
                }

                return updatedMessages;
              },
            );

            // Persist final message to database
            await saveMessagesAction(conversationId, [
              { role: "assistant", content: fullContent },
            ]);

            // Invalidate queries to get fresh data
            queryClient.invalidateQueries({
              queryKey: ["conversation", conversationId],
            });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
          },
          onError: (error) => {
            console.error("Error streaming response:", error);

            // Update message with error indicator
            queryClient.setQueryData(
              ["conversation", conversationId],
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
    // We don't need the onMutate function anymore since we handle it in the wrapper
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

      // Add the tempMessageId to the query data first (optimistic update)
      const targetId = params.conversationId || id;
      if (targetId) {
        await queryClient.cancelQueries({
          queryKey: ["conversation", targetId],
        });

        queryClient.setQueryData(
          ["conversation", targetId],
          (oldData?: MessagesFromSchema) => {
            if (!oldData) return oldData;

            return [
              ...oldData,
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
