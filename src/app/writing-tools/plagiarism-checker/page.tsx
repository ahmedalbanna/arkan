
'use client';

import { PlagiarismCheckerTool } from '@/components/writing-tools/PlagiarismCheckerTool';
import { CopyCheck } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';

export default function PlagiarismCheckerPage() {
  const { t } = useLocalization();
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <CopyCheck className="w-10 h-10" />
          {t('writingTools.plagiarismChecker.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('writingTools.plagiarismChecker.pageSubtitle')}
        </p>
      </div>
      <PlagiarismCheckerTool />
    </div>
  );
}

