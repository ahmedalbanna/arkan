import { Skeleton } from '@/components/ui/skeleton';

import { Loader2 } from 'lucide-react';

export function BuilderPageSkeleton() {
  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-500 overflow-hidden">
      {/* Top Header Skeleton */}
      <div className="h-16 border-b px-6 flex items-center justify-between bg-muted/5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-2.5 w-48 opacity-50" />
          </div>
        </div>
        <Skeleton className="h-9 w-[400px] rounded-xl" />
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar Skeleton */}
        <div className="w-[300px] border-r flex flex-col bg-muted/5">
          <div className="p-4 space-y-6">
            <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 flex-1 rounded-lg" />
            </div>
            <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Center Canvas Skeleton */}
        <div className="flex-1 flex flex-col bg-[#f8fafc] dark:bg-black/20 relative">
            <div className="h-10 border-b px-6 flex items-center justify-between bg-background/50 backdrop-blur-sm">
                <Skeleton className="h-4 w-32 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-full" />
            </div>
            <div className="flex-1 flex justify-center p-12">
                <div className="w-full max-w-[210mm] h-full bg-background shadow-2xl rounded-sm p-16 flex flex-col items-center">
                    <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Synchronizing Neural Workspace</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Sidebar Skeleton */}
        <div className="w-[350px] border-l flex flex-col bg-muted/5">
            <div className="p-6 space-y-8">
                <Skeleton className="h-10 w-full rounded-xl" />
                <div className="space-y-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-48 w-full rounded-[32px]" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-64 w-full rounded-[32px]" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
    return <BuilderPageSkeleton />;
}
