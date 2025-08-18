'use client';

import { MarkdownDisplay } from '@/components/MarkdownDisplay';
import { FileText } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';

export default function MarkdownDisplayPage() {
  const { t } = useLocalization();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <FileText className="w-10 h-10" />
          {t('markdownDisplay.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('markdownDisplay.pageSubtitle')}
        </p>
      </div>
      <MarkdownDisplay />
    </div>
  );
}
