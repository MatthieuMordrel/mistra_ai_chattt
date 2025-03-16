import { ChatMessage } from "@/types/types";
import ChatMessageList from "./ChatMessageList";

export default function ChatMessageContainer({
  messages,
}: {
  messages?: ChatMessage[];
}) {
  return (
    <div className="relative flex-1 overflow-hidden">
      <ChatMessageList messagesServer={messages} />
    </div>
  );
}
