import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import { ConversationsSidebar } from "@/components/sidebar/ConversationList";
import { cachedValidateServerSession } from "@/lib/auth/validateSession";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validate session and redirect if invalid for the whole dashboard
  const { session } = await cachedValidateServerSession(true);
  const userId = session.session.userId;

  return (
    <DashboardLayoutClient>
      <ConversationsSidebar userId={userId} />

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
