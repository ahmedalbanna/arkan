
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { BookOpenText } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamic import for SummarizerTool to reduce initial bundle size
const SummarizerTool = dynamic(() => import('@/components/writing-tools/SummarizerTool'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
});

export default function SummarizerPage() {
  const { t } = useLocalization();
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <BookOpenText className="w-10 h-10" />
          {t('writingTools.summarizer.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('writingTools.summarizer.pageSubtitle')}
        </p>
      </div>
      <Suspense fallback={
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <SummarizerTool />
      </Suspense>
    </div>
  );
}
