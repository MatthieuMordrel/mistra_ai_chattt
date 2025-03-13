import { ConversationService } from "@/db/services/conversation-service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Get the session from auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If no session, redirect to sign-in (this should be handled by validateServerSession in layout)
  if (!session) {
    redirect("/sign-in");
  }

  // Get user ID from session
  const userId = session.user.id;

  // Fetch conversations for the user
  const conversations = await ConversationService.getUserConversations(userId);

  // If there are conversations, redirect to the most recent one
  if (conversations && conversations.length > 0 && conversations[0]?.id) {
    redirect(`/dashboard/chat/${conversations[0].id}`);
  }

  // If no conversations, redirect to create a new one
  redirect("/dashboard/chat/new");
}
