import { useSearchParams } from "next/navigation";

/**
 * Get the conversation id from the search params
 * @returns The conversation id
 */
export function useGetConversationIdFromParams() {
  const params = useSearchParams();
  // Get the last part of the pathname which should be the conversation id
  const conversationId = params?.get("id");
  return conversationId;
}
