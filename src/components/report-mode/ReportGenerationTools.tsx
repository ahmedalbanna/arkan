

'use client';

import { type SectionName as SectionNameType } from '@/ai/schemas';
import { SectionAccordionItem } from '@/components/section/SectionAccordionItem';
import { Accordion } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalization } from '@/context/LocalizationContext';
import { useReportModeGenerator } from '@/hooks';
import { cn } from '@/lib/utils';
import { PanelLeftClose } from 'lucide-react';
import { Button } from '../ui/button';

interface GenerationToolsProps {
    onCollapseToggle: () => void;
}

export const GenerationTools = ({ onCollapseToggle }: GenerationToolsProps) => {
    const {
        isAnythingGenerating,
        activeMutationKey,
        onGenerateSection,
        hasCreditsForSingleSection,
        orderedSections,
        agents,
    } = useReportModeGenerator();

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
                    <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={onCollapseToggle}>
                        <PanelLeftClose className="h-5 w-5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto pr-2">
                <Accordion type="multiple" className="w-full space-y-1">
                    {orderedSections.map((key: any) => {
                        const isGeneratingThis = isAnythingGenerating && activeMutationKey === key;
                        return (
                            <SectionAccordionItem
                                key={key}
                                itemKey={key as SectionNameType}
                                agent={agents.find((a: any) => a.id === key) || agents[0]}
                                onGenerate={() => onGenerateSection(key as SectionNameType)}
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
