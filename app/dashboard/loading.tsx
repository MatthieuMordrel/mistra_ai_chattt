import { ConversationSidebarSkeleton } from "@/components/chat/ConversationSidebarSkeleton";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";

export default function DashboardLoading() {
  return (
    <DashboardLayoutClient>
      <ConversationSidebarSkeleton />
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading...</div>
      </div>
    </DashboardLayoutClient>
  );
}
