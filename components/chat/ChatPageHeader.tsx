import { DAL } from "@/db/dal";
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
  const models = await DAL.model.queries.getActiveModels();
  return (
    <div className="mb-4 flex items-center justify-start gap-6 pb-2">
      <ModelSelector models={models} />
      <ChatTitleLayout />
    </div>
  );
}
