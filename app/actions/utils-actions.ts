"use server";

import { redirect } from "next/navigation";

export async function navigateToConversationAction(conversationId: string) {
  redirect(`/dashboard/chat/${conversationId}`);
}
