
'use client';

import { PencilLine, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';

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

const HandwritingGenerator = dynamic(() => import('@/components/tools/HandwritingGenerator'), {
  ssr: false,
  loading: () => <HandwritingSkeleton />,
});

export default function HandwritingPage() {
  const { t } = useLocalization();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <PencilLine className="w-10 h-10" />
          {t('writingTools.handwriting.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('writingTools.handwriting.pageSubtitle')}
        </p>
      </div>
      <HandwritingGenerator />
    </div>
  );
}
