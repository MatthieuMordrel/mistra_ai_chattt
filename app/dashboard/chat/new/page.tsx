import { ConversationService } from "@/db/services/conversation-service";
import { validateServerSession } from "@/lib/validateSessionServer";
import { redirect } from "next/navigation";

export default async function NewChatPage() {
  const session = await validateServerSession();

  // Create a new conversation
  const conversationId = await ConversationService.createConversationInDB(
    session.user.id,
    "New Conversation",
  );

  // Redirect to the new conversation
  redirect(`/dashboard/chat/${conversationId}`);
}
