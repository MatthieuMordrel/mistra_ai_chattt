"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

export function DashboardLayoutClient({
  children,
}: DashboardLayoutClientProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen">{children}</div>
    </SidebarProvider>
  );
}
