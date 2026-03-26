
'use client';

import { SummarizerTool } from '@/modules/ai/adapters/components/writing-tools/SummarizerTool';
import { BookOpenText } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';

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
      <SummarizerTool />
    </div>
  );
}
