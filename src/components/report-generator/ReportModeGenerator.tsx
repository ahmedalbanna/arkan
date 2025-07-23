
'use client';

import { ReportActions } from './ReportActions';
import { ReportResults } from './ReportResults';
import { AlertCircle } from 'lucide-react';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { GenerationTools } from './ReportGenerationTools';
import { EvaluationTools } from '../EvaluationTools';
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
        setSection,
    } = useReportStore();
    const translateMutation = useTranslate();
    const [isTranslatingAll, setIsTranslatingAll] = useState(false);

  const handleSectionUpdate = (key: SectionName, value: string) => {
    setSection(key, value);
  };


  if (!proposal) {
    return (
        <Card className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center text-muted-foreground p-8">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
                <h3 className="text-lg font-semibold">{t('builder.reportGenerator.noProposal')}</h3>
                <p>{t('builder.reportGenerator.noProposalDesc')}</p>
            </div>
        </Card>
    )
  }

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
      {/* Left Column -> Now the main results view */}
      <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2">
        <ReportActions onTranslateAll={handleTranslateAll} isTranslating={isTranslatingAll} />
        <GenerationTools />
        <EvaluationTools />
      </div>

      {/* Right Column -> All tools */}
      <div className="lg:col-span-8 overflow-y-auto pr-2">
        <ReportResults onSectionUpdate={handleSectionUpdate} />
      </div>
    </div>
  );
}
