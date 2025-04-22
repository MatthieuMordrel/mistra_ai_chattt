import { useParams } from "next/navigation";

/**
 * Get the conversation id from the pathname
 * Integrate with the history.replaceState as it's using usePathname and not useParams
 * @returns The conversation id
 */
export function useGetConversationIdFromParams() {
  const params = useParams();
  // Get the last part of the pathname which should be the conversation id
  const conversationId = params?.id
    ? Array.isArray(params.id)
      ? params.id[0]
      : params.id
    : undefined;
  return conversationId;
}
