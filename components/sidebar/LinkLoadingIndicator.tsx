"use client";

import { cn } from "@/lib/utils";
import { useLinkStatus } from "next/link";
import { LoadingSpinner } from "../skeletons/LinkSpinner";

interface LinkLoadingIndicatorProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LinkLoadingIndicator({
  className,
  size = "sm",
}: LinkLoadingIndicatorProps) {
  const { pending } = useLinkStatus();

  if (!pending) return null;

  return (
    <div
      className={cn("inline-flex transition-opacity duration-300", className)}
    >
      <LoadingSpinner size={size} />
    </div>
  );
}
