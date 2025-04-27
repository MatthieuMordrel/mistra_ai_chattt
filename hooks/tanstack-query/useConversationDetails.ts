import { saveMessagesAction } from "@/actions/conversation-actions";
import {
  fetchConversation,
  MessagesFromSchema,
} from "@/lib/fetchClient/fetchConversation";
import { streamMistralClient } from "@/lib/mistral streaming/mistral-client";
import { useTokenActions } from "@/store/chatStore";
import { ChatMessage } from "@/types/types";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { useGetConversationIdFromParams } from "../useGetConversationIdFromParams";
/**
 * Hook to fetch and manage a specific conversation with its messages
 * @param id The conversation ID
 * @returns The conversation data with messages and mutations
 */
export function useConversationDetails() {
  const conversationId = useGetConversationIdFromParams();
  const queryClient = useQueryClient();
  const { calculateTokenCount } = useTokenActions();

  // Normalize the conversationId to always use "null" string for consistency
  const normalizedId = conversationId || "null";

  // Fetch conversation with messages
  const conversationQuery = useSuspenseQuery({
    queryKey: ["conversation", normalizedId],
    queryFn: fetchConversation,
    refetchOnMount: false,
  });

  // Add an effect to update token count whenever messages change
  useEffect(() => {
    if (conversationQuery.data) {
      // Update token count for all current messages
      calculateTokenCount(conversationQuery.data);
    }
  }, [conversationQuery.data, calculateTokenCount]);

  // Mutation for saving messages to a conversation with optimistic updates
  const saveMessagesMutation = useMutation({
    mutationFn: async (params: {
      messages: ChatMessage[];
      conversationIdMutation?: string;
    }): Promise<{ success: boolean }> => {
      if (!params.conversationIdMutation) {
        throw new Error("Conversation ID is required");
      }
      console.log(
        "params.conversationIdMutation",
        params.conversationIdMutation,
      );
      const result = await saveMessagesAction(
        params.conversationIdMutation,
        params.messages,
      );
      return result;
    },
    // Optimistically update the UI
    onMutate: async (params: {
      messages: ChatMessage[];
      conversationIdMutation?: string;
    }) => {
      if (!params.conversationIdMutation) {
        throw new Error("Conversation ID is required");
      }
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["conversation", params.conversationIdMutation],
      });

      // Snapshot the previous value (now an array of messages)
      const previousMessages = queryClient.getQueryData<MessagesFromSchema>([
        "conversation",
        params.conversationIdMutation,
      ]);

      // Ensure previousMessages is an array
      const safePreviousMessages = Array.isArray(previousMessages)
        ? previousMessages
        : [];

      // Create new messages array with the new messages added
      const updatedMessages = [
        ...safePreviousMessages,
        ...params.messages
          .filter(
            (msg: ChatMessage) =>
              msg.role === "user" || msg.role === "assistant",
          )
          .map((msg: ChatMessage) => ({
            id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            conversationId: params.conversationIdMutation as string,
            isStreaming: false,
            content: msg.content,
            role: msg.role as "user" | "assistant",
            tokens: null,
            createdAt: new Date().toISOString(),
          })),
      ];

      // Optimistically update the cache
      queryClient.setQueryData<MessagesFromSchema>(
        ["conversation", params.conversationIdMutation],
        updatedMessages,
      );

      return { previousMessages: safePreviousMessages };
    },

    // If the mutation fails, roll back
    onError: (err, newParams, context) => {
      console.log("saveMessagesMutation: onError", err);
      if (context?.previousMessages && newParams.conversationIdMutation) {
        queryClient.setQueryData(
          ["conversation", newParams.conversationIdMutation],
          Array.isArray(context.previousMessages)
            ? context.previousMessages
            : [],
        );
      }
    },

    // After success or error, invalidate the queries to refetch
    onSettled: (_, __, params) => {
      if (params?.conversationIdMutation) {
        queryClient.invalidateQueries({
          queryKey: ["conversation", params.conversationIdMutation],
        });
        // Also invalidate the conversations list since updatedAt might have changed
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    },
  });

  // Mutation for streaming assistant responses
  const streamAndSaveMessageMutation = useMutation({
    mutationFn: async ({
      messages,
      modelId,
      tempMessageId,
      conversationIdMutation,
    }: {
      messages: ChatMessage[];
      modelId?: string;
      conversationIdMutation: string;
      tempMessageId: string;
    }) => {
      console.log("conversationIdMutation", conversationIdMutation);
      if (!conversationIdMutation) {
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
                    content: accumulatedContent,
                  };
                }

                // Update token count for all messages including the streaming one
                calculateTokenCount(updatedMessages);
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
      const { success } = await saveMessagesAction(conversationIdMutation, [
        { role: "assistant", content: finalContent },
      ]);

      if (!success) {
        throw new Error("Failed to save messages");
      }

      return { success, finalContent, conversationIdMutation };
    },
    onMutate: async ({ tempMessageId, conversationIdMutation }) => {
      if (!conversationIdMutation) {
        throw new Error("Conversation ID is required");
      }

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["conversation", conversationIdMutation],
      });

      // Get current messages
      const previousMessages = queryClient.getQueryData<MessagesFromSchema>([
        "conversation",
        conversationIdMutation,
      ]);

      // Ensure we're working with an array
      const safeOldData = Array.isArray(previousMessages)
        ? previousMessages
        : [];

      // Add streaming message to cache
      const updatedMessages = [
        ...safeOldData,
        {
          id: tempMessageId,
          conversationId: conversationIdMutation,
          role: "assistant" as const,
          content: "",
          tokens: null,
          createdAt: new Date().toISOString(),
          isStreaming: true,
        },
      ];

      // Update query data
      queryClient.setQueryData(
        ["conversation", conversationIdMutation],
        updatedMessages,
      );

      return { previousMessages: safeOldData };
    },
    onSuccess: (data) => {
      // Invalidate queries to refetch from server
      queryClient.invalidateQueries({
        queryKey: ["conversation", data.conversationIdMutation],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Error in streaming mutation:", error);
    },
  });

  // Return the conversation messages, mutations and loading states
  return {
    messages: conversationQuery.data,
    ...conversationQuery,
    saveMessages: async (
      messages: ChatMessage[],
      conversationIdMutation?: string,
    ) => {
      const targetConversationId = conversationIdMutation || conversationId;

      if (!targetConversationId) {
        throw new Error("Conversation ID is required");
      }

      return saveMessagesMutation.mutateAsync({
        messages,
        conversationIdMutation: targetConversationId,
      });
    },
    isSavingMessages: saveMessagesMutation.isPending,
    streamAndSaveMessage: async (params: {
      messages: ChatMessage[];
      modelId?: string;
      conversationIdMutation: string;
    }) => {
      // Generate a unique ID for the streaming message
      const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Run the mutation with the tempMessageId
      return streamAndSaveMessageMutation.mutateAsync({
        ...params,
        tempMessageId,
        conversationIdMutation: params.conversationIdMutation,
      });
    },
  };
}
