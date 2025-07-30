
'use client';

import { AlertCircle } from 'lucide-react';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { GenerationTools } from './ReportGenerationTools';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useLocalization } from '@/context/LocalizationContext';
import { useTranslate } from '@/hooks/use-translation';
import { toast } from '@/hooks/use-toast';
import { useState, lazy, Suspense } from 'react';
import { SectionName } from '@/ai/schemas';
import { useReportStore } from '@/hooks/useReportStore';
import { Skeleton } from '../ui/skeleton';

const ReportResults = lazy(() => import('./ReportResults').then(mod => ({ default: mod.ReportResults })));

function ReportResultsSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                   <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

export default function ReportGenerator() {
    const { t, locale } = useLocalization();
    const {
        sections,
        setSection,
        setAllTranslatedSections
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

    const translatedMap: { [key in SectionName]?: string } = {};
    results.forEach(result => {
        if ('content' in result) {
            translatedMap[result.key as SectionName] = result.content;
        } else {
            console.error(`Failed to translate section ${result.key}:`, result.error);
        }
    });
    setAllTranslatedSections(translatedMap);

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
        <Suspense fallback={<ReportResultsSkeleton />}>
            <ReportResults onSectionUpdate={handleSectionUpdate} />
        </Suspense>
      </div>
    </div>
  );
}
