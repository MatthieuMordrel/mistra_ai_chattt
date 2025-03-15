import SkeletonChat from "@/components/skeletons/SkeletonChat";

export default function ConversationLoading() {
  return (
    <div className="flex h-full flex-col">
      <SkeletonChat />
    </div>
  );
}
