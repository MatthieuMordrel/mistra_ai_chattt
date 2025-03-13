import { ConversationService } from "@/db/services/conversation-service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function NewChatPage() {
  // Get the session from auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If no session, redirect to sign-in
  if (!session) {
    redirect("/sign-in");
  }

  // Create a new conversation
  const conversationId = await ConversationService.createConversationInDB(
    session.user.id,
    "New Conversation",
  );

  // Redirect to the new conversation
  redirect(`/dashboard/chat/${conversationId}`);
}
