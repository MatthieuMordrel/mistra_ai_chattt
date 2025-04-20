import { saveMessagesAction } from "@/actions/conversation-actions";
import {
  ConversationWithMessagesFromSchema,
  fetchConversation,
} from "@/lib/fetchClient/fetchConversation";
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
export function useConversationDetails(id: string) {
  const queryClient = useQueryClient();

  // Fetch conversation with messages
  const conversationQuery = useSuspenseQuery({
    queryKey: ["conversation", id],
    queryFn: () => fetchConversation(id),
  });

  // Mutation for saving messages to a conversation with optimistic updates
  const saveMessagesMutation = useMutation({
    mutationFn: async (
      messages: ChatMessage[],
    ): Promise<{ success: boolean }> => {
      return saveMessagesAction(id, messages);
    },
    // Optimistically update the UI
    onMutate: async (newMessages) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["conversation", id] });

      // Snapshot the previous value
      const previousConversation =
        queryClient.getQueryData<ConversationWithMessagesFromSchema>([
          "conversation",
          id,
        ]);

      if (previousConversation) {
        // Create a copy of the conversation with the new messages added
        const updatedConversation = {
          ...previousConversation,
          messages: [
            ...previousConversation.messages,
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
          ],
          updatedAt: new Date().toISOString(),
        };

        // Optimistically update the cache
        queryClient.setQueryData<ConversationWithMessagesFromSchema>(
          ["conversation", id],
          updatedConversation,
        );
      }

      return { previousConversation };
    },

    // If the mutation fails, roll back
    onError: (err, newMessages, context) => {
      if (context?.previousConversation) {
        queryClient.setQueryData(
          ["conversation", id],
          context.previousConversation,
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

  // Return the conversation, the saveMessages mutation and loading states
  return {
    conversation: conversationQuery.data,
    ...conversationQuery,
    saveMessages: saveMessagesMutation.mutateAsync,
    isSavingMessages: saveMessagesMutation.isPending,
  };
}
