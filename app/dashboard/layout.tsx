import { ConversationList } from "@/components/chat/ConversationList";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import { validateServerSession } from "@/lib/validateSessionServer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validate session and redirect if invalid for the whole dashboard
  const session = await validateServerSession();
  const userId = session?.user.id;

  return (
    <DashboardLayoutClient>
      <ConversationList userId={userId} />
      <main className="flex-1 overflow-auto">{children}</main>
    </DashboardLayoutClient>
  );
}
