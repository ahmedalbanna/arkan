'use client';

import { AIResearcherTool } from '@/modules/ai/adapters/components/writing-tools/AIResearcherTool';
import { useLocalization } from '@/context/LocalizationContext';
import { Search } from 'lucide-react';

export default function AiResearcherPage() {
  const { t } = useLocalization();
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Search className="w-10 h-10" />
          {t('writingTools.aiResearcher.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('writingTools.aiResearcher.pageSubtitle')}
        </p>
      </div>
      <AIResearcherTool />
    </div>
  );
}
