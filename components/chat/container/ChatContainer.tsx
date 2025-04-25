import ChatInput from "../input/ChatInput";
import ChatMessageList from "./ChatMessageList";

export default function ChatContainer() {
  return (
    <div className="flex h-full flex-col gap-2">
      <ChatMessageList />
      <ChatInput />
    </div>
  );
}
