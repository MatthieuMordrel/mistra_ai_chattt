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
import { useRef } from "react";

// Define fixed widths for skeletons to avoid hydration errors
const SKELETON_WIDTHS = ["70%", "75%", "80%", "65%", "72%"];

export function ConversationSidebarSkeleton() {
  // Use refs to store the fixed widths
  const widthsRef = useRef(SKELETON_WIDTHS);

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="px-4 py-3">
        <Skeleton className="h-7 w-32" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {widthsRef.current.map((_, i) => (
            <SidebarMenuSkeleton
              key={i}
              // Override the random width with our fixed width
              style={
                {
                  "--skeleton-width": widthsRef.current[i],
                } as React.CSSProperties
              }
            />
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
