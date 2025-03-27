import "server-only";

import { cache } from "react";
import {
  createConversationInDB,
  deleteConversation,
  getConversation,
  getUserConversations,
  saveMessages,
  updateConversationTitle,
} from "./services/conversation-service";
import { ModelService } from "./services/model-service";

export const DAL = {
  conversation: {
    queries: {
      getConversation: cache(getConversation),
      getUserConversations: cache(getUserConversations),
    },
    mutations: {
      createConversation: createConversationInDB,
      updateConversationTitle: updateConversationTitle,
      saveMessages: saveMessages,
      deleteConversation: deleteConversation,
    },
  },
  model: {
    queries: {
      getActiveModels: cache(ModelService.getActiveModels),
      getModelById: cache(ModelService.getModelById),
    },
  },
};
