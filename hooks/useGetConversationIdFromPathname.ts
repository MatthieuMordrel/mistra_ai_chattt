import { usePathname } from "next/navigation";

/**
 * Get the conversation id from the pathname
 * Integrate with the history.replaceState as it's using usePathname and not useParams
 * @returns The conversation id
 * @deprecated use useGetConversationIdFromParams instead
 */
export function useGetConversationIdFromPathname() {
  const pathname = usePathname();
  // Get the last part of the pathname which should be the conversation id
  const conversationId = pathname?.split("/").pop();
  return conversationId;
}
