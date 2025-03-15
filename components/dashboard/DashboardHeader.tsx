"use client";

import NavBar from "../navbar/NavBar";

/**
 * Header component for the dashboard layout
 * Contains the navigation bar with dashboard and sign out buttons
 * This is placed at the layout level to be shared across all dashboard routes
 */
export function DashboardHeader() {
  return (
    <div className="flex h-16 items-center border-b px-4">
      {/* <SidebarTrigger /> */}
      <NavBar showDashboard={true} showSignOut={true} />
    </div>
  );
}
