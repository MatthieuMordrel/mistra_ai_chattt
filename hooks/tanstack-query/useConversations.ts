import { createConversationAction } from "@/actions/conversation-actions";
import { fetchConversations } from "@/lib/fetchClient/fetchConversations";
import { getQueryClient } from "@/providers/QueryProvider";
import { ChatMessage, Conversation } from "@/types/types";
import { useMutation, useQuery } from "@tanstack/react-query";

/**
 * id of the created conversation
 */
interface CreateConversationResult {
  id: string;
}

export function useConversations() {
  const queryClient = getQueryClient();

  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Mutation for creating a new conversation with optimistic updates
  const createConversationMutation = useMutation({
    mutationFn: async ({
      title,
      messages,
    }: {
      title: string;
      messages?: ChatMessage[];
    }): Promise<CreateConversationResult> => {
      return createConversationAction(title, messages || []);
    },

    // Optimistically update the UI
    onMutate: async (newConversation) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["conversations"] });

      // Snapshot the previous value
      const previousConversations =
        queryClient.getQueryData<Conversation[]>(["conversations"]) || [];

      // Create a temporary conversation object
      const tempConversation: Conversation = {
        id: `temp-${Date.now()}`,
        title: newConversation.title,
        updatedAt: new Date().toISOString(),
      };

      // Optimistically update the cache
      queryClient.setQueryData<Conversation[]>(
        ["conversations"],
        (old = []) => {
          return [tempConversation, ...old];
        },
      );

      return { previousConversations };
    },

    // If the mutation fails, roll back
    onError: (err, newConversation, context) => {
      if (context?.previousConversations) {
        queryClient.setQueryData(
          ["conversations"],
          context.previousConversations,
        );
      }
    },

    // After success or error, invalidate the query to refetch
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Return the conversations, the createConversation mutation and the isCreatingConversation state
  return {
    conversations: conversationsQuery.data,
    ...conversationsQuery,
    createConversation: createConversationMutation.mutateAsync,
    isCreatingConversation: createConversationMutation.isPending,
  };
}
