"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export function ConversationSidebarSkeleton() {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="px-4 py-3">
        <Skeleton className="h-7 w-32" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {Array.from({ length: 5 }).map((_, i) => (
            <SidebarMenuSkeleton key={i} />
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button disabled className="w-full">
          <Skeleton className="mr-2 h-4 w-4" />
          <Skeleton className="h-4 w-28" />
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
