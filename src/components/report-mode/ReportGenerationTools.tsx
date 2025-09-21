
'use client';

import React from 'react';
import { Accordion } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type SectionName as SectionNameType } from '@/ai/schemas';
import { Loader2 } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { useReportGenerationLogic } from '@/hooks';
import { SectionAccordionItem } from '@/components/section/SectionAccordionItem';

interface GenerationToolsProps {}

export const GenerationTools = (props: GenerationToolsProps) => {
    const {
        isAnythingGenerating,
        activeMutationKey,
        onGenerateSection,
        hasCreditsForSingleSection,
        orderedSections,
    } = useReportGenerationLogic();

    const isDisabled = isAnythingGenerating;
    const { t } = useLocalization();


    return (
        <Card className={cn("flex flex-col h-full", (isDisabled) && 'opacity-50 pointer-events-none')}>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="font-headline">{t('builder.reportGenerator.toolsTitle')}</CardTitle>
                        <CardDescription>{t('builder.reportGenerator.toolsDesc')}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto pr-2">
                <Accordion type="multiple" className="w-full space-y-1">
                    {orderedSections.map((key) => {
                        const isGeneratingThis = isAnythingGenerating && activeMutationKey === key;
                        return (
                            <SectionAccordionItem
                                key={key}
                                sectionKey={key as SectionNameType}
                                onGenerate={onGenerateSection}
                                isGenerating={isGeneratingThis}
                                isAnythingGenerating={isAnythingGenerating}
                                hasCredits={!!hasCreditsForSingleSection}
                            />
                        );
                    })}
                </Accordion>
            </CardContent>
        </Card>
    );
};
