import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import { ConversationsSidebar } from "@/components/sidebar/ConversationList";
import { cachedValidateServerSession } from "@/lib/auth/validateSession";
import Providers from "@/providers/Providers";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await cachedValidateServerSession();

  return (
    <Providers>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-right" />
      <DashboardLayoutClient>
        <ConversationsSidebar />

        {/* Main content area */}
        <div className="flex w-full flex-1 flex-col">
          {/* Dashboard header with navigation */}
          <DashboardHeader />

          {/* Main content */}
          <main className="flex-1 overflow-auto p-4">{children}</main>
        </div>
      </DashboardLayoutClient>
    </Providers>
  );
}
