import { ConversationsSidebar } from "@/components/chat/ConversationList";
import { ConversationSidebarSkeleton } from "@/components/chat/ConversationSidebarSkeleton";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import NavBar from "@/components/navbar_/NavBar";
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
      {/* Sidebar component - now client-side with TanStack Query */}
      <Suspense fallback={<ConversationSidebarSkeleton />}>
        <ConversationsSidebar userId={userId} />
      </Suspense>

      {/* Main content area */}
      <div className="flex w-full flex-1 flex-col">
        <div className="flex h-16 items-center px-4">
          {/* <SidebarTrigger /> */}
          <NavBar showDashboard={true} showSignOut={true} />
        </div>
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </DashboardLayoutClient>
  );
}
