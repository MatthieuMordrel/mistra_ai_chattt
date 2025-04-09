import { createConversationAction } from "@/actions/conversation-actions";
import { fetchConversations } from "@/lib/fetchClient/fetchConversations";
import { ChatMessage, Conversation } from "@/types/types";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

/**
 * Main hook for conversations data with optional selector
 * @param select Optional function to transform the conversations data
 * @returns The conversations data and mutations
 */
export function useConversations<TData = Conversation[]>(
  select?: (data: Conversation[]) => TData,
) {
  const conversationsQuery = useSuspenseQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    select,
  });

  const queryClient = useQueryClient();
  // Mutation for creating a new conversation with optimistic updates
  const createConversationMutation = useMutation({
    mutationFn: async ({
      title,
      messages,
    }: {
      title: string;
      messages?: ChatMessage[];
    }): Promise<{ id: string }> => {
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

/**
 * Hook to retrieve a specific conversation by ID
 * @param id The conversation ID to find
 * @returns The query result with the found conversation or undefined
 */
export function useConversation(id: string | null) {
  const { conversations } = useConversations((data) =>
    id ? data.find((conversation) => conversation.id === id) : undefined,
  );
  return conversations;
}
