import { ModelService } from "@/db/services/model-service";
import ChatTitleLayout from "./ChatTitle copy";
import { ModelSelector } from "./ModelSelector";
/**
 * Header component for the chat page
 * Displays the conversation title and model selector
 * This component is placed in the chat layout to be truly shared across all chat routes
 * The conversation title is reactive and updates based on the current conversation
 */
export async function ChatPageHeader() {
  //Get the models from the db on the server
  const models = await ModelService.getActiveModels();
  return (
    <div className="mb-4 flex items-center justify-between border-b pb-2">
      <ChatTitleLayout />
      <div className="flex gap-2">
        <ModelSelector models={models} />
      </div>
    </div>
  );
}
