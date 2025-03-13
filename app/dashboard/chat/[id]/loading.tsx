import { Skeleton } from "@/components/ui/skeleton";

export default function ConversationLoading() {
  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-4xl flex-col p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-3/4" />
          <Skeleton className="h-20 w-5/6" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
