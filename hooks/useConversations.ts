import { deleteConversation } from "@/app/actions/conversation-actions";
import { useSession } from "@/lib/auth-client";
import { useCallback, useEffect, useState } from "react";

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
 * Hook for fetching and managing conversations
 */
export function useConversations() {
  const { data: sessionData } = useSession();
  const isAuthenticated = !!sessionData?.user;

  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch all conversations for the current user
   */
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) {
      setConversations([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/conversations");

      if (!response.ok) {
        throw new Error(`Error fetching conversations: ${response.status}`);
      }

      const data = await response.json();

      // Convert date strings to Date objects
      const formattedData = data.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
      }));

      setConversations(formattedData);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch conversations"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Delete a conversation using the server action
   */
  const handleDeleteConversation = useCallback(
    async (conversationId: string) => {
      if (!isAuthenticated) return;

      try {
        await deleteConversation(conversationId);
        // Update the conversations list after deletion
        setConversations((prev) =>
          prev.filter((conv) => conv.id !== conversationId),
        );
      } catch (err) {
        console.error("Error deleting conversation:", err);
        throw err;
      }
    },
    [isAuthenticated],
  );

  /**
   * Fetch conversations when the component mounts or authentication status changes
   */
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    isLoading,
    error,
    fetchConversations,
    deleteConversation: handleDeleteConversation,
  };
}
