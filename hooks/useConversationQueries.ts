"use client";

import {
  createConversation,
  deleteConversation,
  saveMessages,
  updateConversationTitle,
} from "@/app/actions/conversation-actions";
import { useAuthStore } from "@/store/authStore";
import { ChatMessage } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
 * Type for conversation with messages
 */
export interface ConversationWithMessages {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
}

/**
 * Fetches all conversations for the current user
 */
async function fetchConversations(): Promise<ConversationData[]> {
  const response = await fetch("/api/conversations");

  if (!response.ok) {
    throw new Error("Failed to fetch conversations");
  }

  const data = await response.json();

  // Convert date strings to Date objects
  return data.map((conversation: any) => ({
    ...conversation,
    createdAt: new Date(conversation.createdAt),
    updatedAt: new Date(conversation.updatedAt),
  }));
}

/**
 * Fetches a single conversation with its messages
 */
async function fetchConversation(
  id: string,
): Promise<ConversationWithMessages> {
  const response = await fetch(`/api/conversations/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch conversation");
  }

  const data = await response.json();

  // Convert date strings to Date objects
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
}

/**
 * Hook for fetching all conversations
 */
export function useConversations() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    data: conversations = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    enabled: isAuthenticated, // Only fetch if authenticated
  });

  return {
    conversations,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for fetching a single conversation with its messages
 */
export function useConversation(id: string | null) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    data: conversation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["conversation", id],
    queryFn: () => fetchConversation(id!),
    enabled: isAuthenticated && !!id, // Only fetch if authenticated and id exists
  });

  return {
    conversation,
    isLoading,
    error,
  };
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
