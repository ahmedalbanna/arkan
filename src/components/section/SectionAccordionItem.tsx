
'use client';

import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { type SectionName as SectionNameType } from '@/ai/schemas';
import { Loader2, Sparkles, GripVertical } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSectionAccordionItemLogic } from '@/hooks';

export const SectionAccordionItem = ({
    sectionKey,
    onGenerate,
    isGenerating,
    isAnythingGenerating,
    hasCredits,
    handleProps,
}: {
    sectionKey: SectionNameType,
    onGenerate: (section: SectionNameType) => void,
    isGenerating: boolean,
    isAnythingGenerating: boolean,
    hasCredits: boolean,
    handleProps?: any,
}) => {
    const {
        t,
        title,
        disabledReason,
    } = useSectionAccordionItemLogic(sectionKey);

    // Context is now auto-selected by the AI, so we only disable based on credits/processing state.
    const canGenerate = hasCredits && !isAnythingGenerating;

    return (
        <AccordionItem value={sectionKey} key={sectionKey} className="bg-background border rounded-lg">
            <div className="flex items-center" >
                {handleProps && (
                    <div {...handleProps} className="p-2 cursor-grab touch-none">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>
                )}
                <AccordionTrigger className="flex-1 rounded-md px-4 py-2 text-sm font-medium hover:no-underline">
                    <div className="flex items-center gap-2">
                        {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
                        {t(title)}
                    </div>
                </AccordionTrigger>
                <div className="p-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="w-full">
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => onGenerate(sectionKey)}
                                        disabled={!canGenerate}
                                        className="font-headline"
                                    >
                                        {isGenerating ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                                        {t('builder.reportGenerator.generateButton')}
                                    </Button>
                                </div>
                            </TooltipTrigger>
                            {disabledReason && (
                                <TooltipContent>
                                    <p>{disabledReason}</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
            <AccordionContent className="p-4 border-t text-xs text-muted-foreground">
                {t('builder.reportGenerator.autoContextNote')}
            </AccordionContent>
        </AccordionItem>
    );
};
