import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Binary, Cpu, Layers } from 'lucide-react';

/**
 * BuilderPageSkeleton — Standardized loading manifest for the workspace.
 * Aligned with the professional structural standard.
 */

export function BuilderPageSkeleton() {
  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-500 overflow-hidden">
      {/* 1. HEADER SKELETON */}
      <div className="h-16 border-b px-8 flex items-center justify-between bg-muted/5 relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px]" />
        
        <div className="flex items-center gap-5 relative z-10">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/20" />
                <Skeleton className="h-2 w-32 opacity-40" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 relative z-10">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* 2. LEFT SIDEBAR SKELETON */}
        <div className="w-[320px] border-r border-primary/5 flex flex-col bg-muted/5">
          <div className="p-6 space-y-10">
            <div className="space-y-4">
                <Skeleton className="h-3 w-24 opacity-40" />
                <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded-md opacity-20" />
                    <Skeleton className="h-3 w-32 opacity-30" />
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-12 w-full rounded-xl opacity-60" />
                    <Skeleton className="h-12 w-full rounded-xl opacity-40" />
                    <Skeleton className="h-12 w-full rounded-xl opacity-20" />
                </div>
            </div>
          </div>
        </div>

        {/* 3. CENTER CANVAS SKELETON */}
        <div className="flex-1 flex flex-col bg-[#f8fafc] dark:bg-[#0f172a] relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px]" />
            
            <div className="h-12 border-b border-border/40 bg-background/50 backdrop-blur-md px-8 flex items-center justify-between relative z-10">
                <Skeleton className="h-4 w-48 rounded-full opacity-30" />
                <div className="flex gap-4">
                    <Skeleton className="h-4 w-20 rounded-full opacity-20" />
                    <Skeleton className="h-4 w-20 rounded-full opacity-20" />
                </div>
            </div>

            <div className="flex-1 flex justify-center p-16 overflow-hidden relative z-10">
                {/* Physical A4 Card Skeleton */}
                <div className="w-full max-w-[210mm] h-[calc(100vh-200px)] bg-background border border-border/40 shadow-2xl rounded-sm p-20 flex flex-col items-center">
                    <div className="flex flex-col items-center justify-center h-full space-y-8 animate-pulse">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-primary/5 rounded-full blur-xl animate-pulse" />
                            <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
                        </div>
                        <div className="space-y-3 text-center">
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/60">Initializing Workspace</p>
                            <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">Synchronizing Environment</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Zoom HUD Skeleton */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
                <Skeleton className="h-11 w-48 rounded-full border border-primary/10 bg-background/80 backdrop-blur-xl" />
            </div>
        </div>

        {/* 4. RIGHT SIDEBAR SKELETON */}
        <div className="w-[400px] border-l border-primary/5 flex flex-col bg-muted/5">
            <div className="p-8 space-y-10">
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full rounded-2xl opacity-60" />
                    <Skeleton className="h-4 w-32 opacity-30" />
                </div>
                <div className="space-y-6">
                    <div className="p-6 rounded-[32px] border border-primary/5 bg-primary/[0.02] space-y-4">
                        <Skeleton className="h-3 w-24 opacity-20" />
                        <Skeleton className="h-4 w-full rounded-full opacity-40" />
                        <Skeleton className="h-1.5 w-full rounded-full bg-primary/10" />
                    </div>
                    <div className="space-y-4 pt-4">
                        <Skeleton className="h-3 w-40 opacity-30 px-1" />
                        <div className="grid grid-cols-2 gap-3">
                            <Skeleton className="h-10 rounded-xl opacity-40" />
                            <Skeleton className="h-10 rounded-xl opacity-40" />
                            <Skeleton className="h-10 rounded-xl opacity-20" />
                            <Skeleton className="h-10 rounded-xl opacity-20" />
                        </div>
                    </div>
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
