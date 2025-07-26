
'use client';

import { ReportResults } from './ReportResults';
import { AlertCircle } from 'lucide-react';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { GenerationTools } from './ReportGenerationTools';
import { Card } from '@/components/ui/card';
import { useLocalization } from '@/context/LocalizationContext';
import { useTranslate } from '@/hooks/use-translation';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { SectionName } from '@/ai/schemas';
import { useReportStore } from '@/hooks/useReportStore';

export default function ReportGenerator() {
    const { t, locale } = useLocalization();
    const { proposal } = useBuilderStore();
    const {
        sections,
        externalContext,
        setSection,
    } = useReportStore();
    const translateMutation = useTranslate();
    const [isTranslatingAll, setIsTranslatingAll] = useState(false);

  const handleSectionUpdate = (key: SectionName, value: string) => {
    setSection(key, value);
  };


  const handleTranslateAll = async (targetLang: 'en' | 'ar') => {
    setIsTranslatingAll(true);
    toast({
        title: t('builder.reportGenerator.toasts.translateAllStarted'),
        description: t('builder.reportGenerator.toasts.translateAllStartedDesc'),
    });

    const sectionKeys = Object.keys(sections).filter(key => sections[key as SectionName]) as SectionName[];

    const translationPromises = sectionKeys.map(key => {
        const content = sections[key]!;
        return translateMutation.mutateAsync({ text: content, targetLang })
            .then(result => ({ key, content: result.translatedText }))
            .catch(error => ({ key, error }));
    });

    const results = await Promise.all(translationPromises);

    results.forEach(result => {
        if ('content' in result) {
            setSection(result.key, result.content);
        } else {
            console.error(`Failed to translate section ${result.key}:`, result.error);
        }
    });

    setIsTranslatingAll(false);
    toast({
        title: t('builder.reportGenerator.toasts.translateAllSuccess'),
        description: t('builder.reportGenerator.toasts.translateAllSuccessDesc'),
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Left Column: Generation Tools */}
      <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2">
        <GenerationTools onTranslateAll={handleTranslateAll} isTranslating={isTranslatingAll} />
      </div>

      {/* Right Column: Report Results */}
      <div className="lg:col-span-8 overflow-y-auto pr-2">
        <ReportResults onSectionUpdate={handleSectionUpdate} />
      </div>
    </div>
  );
}
