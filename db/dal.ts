import "server-only";

import { cache } from "react";
import { conversationService } from "./services/conversation-service";
import { modelService } from "./services/model-service";

// prettier-ignore
export const DAL = {
  conversation: {
    queries: {
      getConversationMessages: cache(
        conversationService.queries.getConversationMessages,
      ),
      getConversationTitle: cache(
        conversationService.queries.getConversationTitle,
      ),
      getUserConversations: cache(conversationService.queries.getUserConversations),
    },
    mutations: {
      createConversation: conversationService.mutations.createConversation,
      updateConversationTitle: conversationService.mutations.updateConversationTitle,
      saveMessages: conversationService.mutations.saveMessages,
      deleteConversation: conversationService.mutations.deleteConversation,
    },
  },
  model: {
    queries: {
      getActiveModels: cache(modelService.queries.getActiveModels),
      getModelById: cache(modelService.queries.getModelById),
    },
  },
};
