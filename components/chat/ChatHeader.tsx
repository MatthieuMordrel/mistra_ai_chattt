"use client";
import { useChatStore } from "@/store/chatStore";
import { Model, useModelStore } from "@/store/modelStore";
import { useEffect, useState } from "react";
import { ModelSelector } from "./ModelSelector";

/**
 * Header component for the chat interface
 * Displays the conversation title and provides a model selector
 * Includes initialization logic to prevent flash of default state
 */
const ChatHeader = ({
  titleServer: title,
  modelsServer,
}: {
  titleServer?: string;
  modelsServer: Model[];
}) => {
  // State to track if we've initialized the store
  const [isInitialized, setIsInitialized] = useState(false);
  const setConversationTitle = useChatStore(
    (state) => state.setConversationTitle,
  );
  const setModels = useModelStore((state) => state.setModels);
  const models = useModelStore((state) => state.models);

  useEffect(() => {
    if (!isInitialized && title) {
      setConversationTitle(title);
      setIsInitialized(true);
      setModels(modelsServer);
    }
  }, [isInitialized, title, setConversationTitle, setModels, modelsServer]);

  // Use modelsServer as fallback if models from store is empty
  const modelsToUse = models && models.length > 0 ? models : modelsServer || [];

  return (
    <div className="mb-4 flex items-center justify-between border-b pb-2">
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="flex gap-2">
        <ModelSelector models={modelsToUse} />
      </div>
    </div>
  );
};

export default ChatHeader;
