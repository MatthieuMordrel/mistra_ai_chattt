import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import { ServerModelsLoader } from "@/components/providers/ServerModelsLoader";
import { ConversationsSidebar } from "@/components/sidebar/ConversationList";
import { ConversationSidebarSkeleton } from "@/components/skeletons/ConversationSidebarSkeleton";
import { validateServerSession } from "@/lib/auth/validateSession";
import { Suspense } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validate session and redirect if invalid for the whole dashboard
  const session = await validateServerSession("/sign-in");
  const userId = session.session.userId;

  return (
    <DashboardLayoutClient>
      {/* Load models at the layout level to share across all dashboard pages */}
      <ServerModelsLoader />

      <Suspense fallback={<ConversationSidebarSkeleton />}>
        <ConversationsSidebar userId={userId} />
      </Suspense>

      {/* Main content area */}
      <div className="flex w-full flex-1 flex-col">
        {/* Dashboard header with navigation */}
        <DashboardHeader />

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </DashboardLayoutClient>
  );
}
