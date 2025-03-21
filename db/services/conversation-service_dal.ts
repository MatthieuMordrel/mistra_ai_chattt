import "server-only";

import { cache } from "react";
import { ConversationService } from "./conversation-service";

export const cacheGetConversation = cache(ConversationService.getConversation);
export const cacheGetUserConversations = cache(
  ConversationService.getUserConversations,
);
