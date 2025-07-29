
'use client';

import { PencilLine, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const HandwritingSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Skeleton className="h-[600px] w-full" />
        </div>
        <div>
            <Skeleton className="h-[600px] w-full" />
        </div>
    </div>
);

const HandwritingGenerator = dynamic(() => import('@/components/HandwritingGenerator'), {
  ssr: false,
  loading: () => <HandwritingSkeleton />,
});

export default function HandwritingPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <PencilLine className="w-10 h-10" />
          Text to Handwriting
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Convert your typed text into a realistic handwriting style.
        </p>
      </div>
      <HandwritingGenerator />
    </div>
  );
}
