import { ClientConversationList } from "./ClientConversationList";

export function ConversationList({ userId }: { userId: string }) {
  // If no session, return empty sidebar
  if (!userId) {
    return null;
  }

  // Return the client-side wrapper
  return <ClientConversationList />;
}
