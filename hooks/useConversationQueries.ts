"use client";

import {
  createConversation,
  deleteConversation,
  saveMessages,
  updateConversationTitle,
} from "@/app/actions/conversation-actions";
import { ChatMessage } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Type for conversation data returned from the API
 */
export interface ConversationData {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Hook for conversation mutations (create, update, delete)
 */
export function useConversationMutations() {
  const queryClient = useQueryClient();

  // Create a new conversation
  const createMutation = useMutation({
    mutationFn: async ({
      title,
      messages,
    }: {
      title: string;
      messages: ChatMessage[];
    }) => {
      try {
        const result = await createConversation(title, messages);
        // Ensure we return an object with an id property
        return { id: result?.id || null };
      } catch (error) {
        console.error("Error in createConversation mutation:", error);
        return { id: null };
      }
    },
    onSuccess: () => {
      // Invalidate conversations query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Update conversation title
  const updateTitleMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      return updateConversationTitle(id, title);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific conversation and conversations list
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Save messages to a conversation
  const saveMessagesMutation = useMutation({
    mutationFn: async ({
      id,
      messages,
    }: {
      id: string;
      messages: ChatMessage[];
    }) => {
      return saveMessages(id, messages);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific conversation
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.id],
      });
    },
  });

  // Delete a conversation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteConversation(id);
    },
    onSuccess: () => {
      // Invalidate conversations query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return {
    createConversation: createMutation.mutate,
    isCreating: createMutation.isPending,

    updateTitle: updateTitleMutation.mutate,
    isUpdatingTitle: updateTitleMutation.isPending,

    saveMessages: saveMessagesMutation.mutate,
    isSavingMessages: saveMessagesMutation.isPending,

    deleteConversation: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
