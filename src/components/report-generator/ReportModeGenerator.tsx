

'use client';

import { AlertCircle, PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { GenerationTools } from './ReportGenerationTools';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useLocalization } from '../../context/LocalizationContext';
import { useTranslate } from '@/hooks/use-translation';
import { toast } from '@/hooks/use-toast';
import { useState, lazy, Suspense } from 'react';
import { SectionName } from '@/ai/schemas';
import { useReportStore } from '@/hooks/useReportStore';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

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
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
       {isPanelCollapsed && (
            <div className="hidden lg:block lg:col-span-1 sticky top-24">
                <Button
                    variant="secondary"
                    className="h-auto p-2 rounded-l-none [writing-mode:vertical-lr] transform rotate-180"
                    onClick={() => setIsPanelCollapsed(false)}
                >
                   {t('builder.reportGenerator.toolsTitle')}
                </Button>
            </div>
        )}
      {/* Left Column: Generation Tools */}
      <div className={cn("lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2 transition-all duration-300", isPanelCollapsed && "lg:hidden")}>
        <GenerationTools onTranslateAll={handleTranslateAll} isTranslating={isTranslatingAll} onCollapseToggle={() => setIsPanelCollapsed(true)} />
      </div>

      {/* Right Column: Report Results */}
       <div className={cn("lg:overflow-y-auto pr-2", isPanelCollapsed ? "lg:col-span-11" : "lg:col-span-8")}>
        <Suspense fallback={<ReportResultsSkeleton />}>
            <ReportResults onSectionUpdate={handleSectionUpdate} />
        </Suspense>
      </div>
    </div>
  );
}
