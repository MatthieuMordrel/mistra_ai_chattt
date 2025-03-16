import { ModelService } from "@/db/services/model-service";
import { ModelSelector } from "./ModelSelector";
/**
 * Header component for the chat page
 * Displays the conversation title and model selector
 * This component is placed in the chat layout to be truly shared across all chat routes
 * The conversation title is reactive and updates based on the current conversation
 */
export async function ChatPageHeader() {
  // Get the conversation title directly from the store
  // const conversationTitle = useChatStore((state) => state.conversationTitle);
  //Get the user id from the session
  // const { session, headers } = await cachedValidateServerSession();
  // //Get the pathname from the headers
  // const pathname = new URL(headers.get("next-url") as string).pathname;
  // //Get the conversation id from the pathname
  // const conversationId = pathname.split("/").pop();
  // //Get the conversation title by calling the db
  // const conversation = await ConversationService.getConversation(
  //   conversationId as string,
  //   session?.session.userId as string,
  // );
  // const conversationTitle = conversation?.title;

  //Get the models from the db on the server
  const models = await ModelService.getActiveModels();
  return (
    <div className="mb-4 flex items-center justify-end border-b pb-2">
      {/* <h1 className="text-xl font-bold">{conversationTitle}</h1> */}
      <div className="flex gap-2">
        <ModelSelector models={models} />
      </div>
    </div>
  );
}
