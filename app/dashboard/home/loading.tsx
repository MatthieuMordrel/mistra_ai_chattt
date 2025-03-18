import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import { ConversationSidebarSkeleton } from "@/components/skeletons/ConversationSidebarSkeleton";
import SkeletonChat from "@/components/skeletons/SkeletonChat";
export default function DashboardLoading() {
  return (
    <DashboardLayoutClient>
      <ConversationSidebarSkeleton />
      <SkeletonChat />
    </DashboardLayoutClient>
  );
}
