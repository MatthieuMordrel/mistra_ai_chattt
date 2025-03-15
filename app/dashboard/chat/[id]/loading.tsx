import SkeletonChat from "@/components/chat/SkeletonChat";

export default function ConversationLoading() {
  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-4xl flex-col p-4">
      <SkeletonChat />
    </div>
  );
}
