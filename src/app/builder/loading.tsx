import { Skeleton } from '@/components/ui/skeleton';

export function BuilderPageSkeleton() {
  return (
    <div className="space-y-4 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-[400px]" />
      </div>
      <Skeleton className="h-[calc(100vh-220px)] w-full" />
    </div>
  );
}

export default function Loading() {
    return <BuilderPageSkeleton />;
}
