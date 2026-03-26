
'use client';

import { HumanizerTool } from '@/modules/ai/adapters/components/writing-tools/HumanizerTool';
import { useLocalization } from '@/context/LocalizationContext';
import { UserCheck } from 'lucide-react';

export default function HumanizerPage() {
  const { t } = useLocalization();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <UserCheck className="w-10 h-10" />
          {t('writingTools.humanizer.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('writingTools.humanizer.pageSubtitle')}
        </p>
      </div>
      <HumanizerTool />
    </div>
  );
}
