import { createConversationAction } from "@/actions/conversation-actions";
import {
  Conversation,
  fetchConversations,
} from "@/lib/fetchClient/fetchConversations";
import { ChatMessage } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Define the return type of createConversationAction
interface CreateConversationResult {
  id: string;
}

export function useConversations() {
  const queryClient = useQueryClient();

  // Query for fetching conversations with better initial loading state handling
  const { data: conversations = [], ...queryRest } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    // Disable automatic refetching on window focus to avoid hydration issues
    refetchOnWindowFocus: false,
    // Ensure consistent initial loading state
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    conversations,
    ...queryRest,
    createConversation: createConversationMutation.mutateAsync,
    isCreatingConversation: createConversationMutation.isPending,
  };
}
