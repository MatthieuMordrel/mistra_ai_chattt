import { ConversationList } from "@/components/chat/ConversationList";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import NavBar from "@/components/navbar/NavBar";
import { validateServerSession } from "@/lib/validateSession";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validate session and redirect if invalid for the whole dashboard
  const session = await validateServerSession();
  const userId = session.user.id;

  return (
    <DashboardLayoutClient>
      {/* Sidebar component - now client-side with TanStack Query */}
      <ConversationList userId={userId} />

      {/* Main content area */}
      <div className="flex w-full flex-1 flex-col">
        <div className="flex h-16 items-center px-4">
          {/* <SidebarTrigger /> */}
          <NavBar />
        </div>
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </DashboardLayoutClient>
  );
}
