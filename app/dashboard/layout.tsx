import { validateServerSession } from "@/lib/validateSessionServer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validate session and redirect if invalid for the whole dashboard
  await validateServerSession();

  return <>{children}</>;
}
