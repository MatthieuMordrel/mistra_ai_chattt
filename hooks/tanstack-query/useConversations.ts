import { createConversationAction } from "@/actions/conversation-actions";
import { MessagesFromSchema } from "@/lib/fetchClient/fetchConversation";
import {
  ConversationFromSchema,
  fetchConversations,
} from "@/lib/fetchClient/fetchConversations";
import { ChatMessage } from "@/types/types";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";

/**
 * Main hook for conversations data with optional selector
 * @param select Optional function to transform the conversations data
 * @returns The conversations data and mutations
 */
export function useConversations<TData = ConversationFromSchema[]>(
  select?: (data: ConversationFromSchema[]) => TData,
) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const conversationsQuery = useSuspenseQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    select,
  });

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
        queryClient.getQueryData<ConversationFromSchema[]>(["conversations"]) ||
        [];

      // Create a temporary conversation object
      const tempConversation: ConversationFromSchema = {
        id: `temp-${Date.now()}`,
        title: newConversation.title,
        updatedAt: new Date().toISOString(),
      };

      // Optimistically update the cache
      queryClient.setQueryData<ConversationFromSchema[]>(
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
    //onSuccess receives by default the return value of the mutation
    onSuccess: (data) => {
      // Get the existing messages (including optimistic updates)
      const existingMessages =
        queryClient.getQueryData<MessagesFromSchema>([
          "conversation",
          "null",
        ]) || [];
      console.log("data.id", data.id);

      // Preserve the structure format that matches MessagesFromSchema
      const safeExistingMessages = Array.isArray(existingMessages)
        ? existingMessages
        : [];

      // Update the conversationId for all existing messages
      const updatedMessages = safeExistingMessages.map((msg) => ({
        ...msg,
        conversationId: data.id,
      }));

      // Set the query data for the new conversation with all messages
      queryClient.setQueryData(["conversation", data.id], updatedMessages);
      router.prefetch(`/dashboard/chat?id=${data.id}`);

      // Navigate to the new conversation, adding a small delay to make it work, tbh not exactly sure how it solves the issue of the suspense boundary showing the skeleton
      setTimeout(() => {
        router.replace(`/dashboard/chat?id=${data.id}`);
      }, 100);
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
 * @param id The conversation ID to find (can be undefined/null when no ID is available)
 * @returns The query result with the found conversation or undefined
 */
export function useConversation(id?: string | undefined) {
  const { conversations } = useConversations((data) =>
    id ? data.find((conversation) => conversation.id === id) : undefined,
  );
  return { conversation: conversations };
}
