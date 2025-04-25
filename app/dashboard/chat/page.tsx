import { cachedValidateServerSession } from "@/lib/auth/validateSession";
/**
 * Chat page component for new conversations
 * Uses the ChatContainer component for the UI
 */
export default async function ChatPage() {
  await cachedValidateServerSession(true);
  return <></>;
}
