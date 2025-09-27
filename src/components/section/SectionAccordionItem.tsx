
'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { type SectionName as SectionNameType, type DiagramType } from '@/ai/schemas';
import { Loader2, Sparkles, GripVertical } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSectionAccordionItemLogic } from '@/hooks';
import type { Agent } from '@/lib/models/agent';

export const SectionAccordionItem = ({
    itemKey,
    agent,
    onGenerate,
    isGenerating,
    isAnythingGenerating,
    hasCredits,
    handleProps,
}: {
    itemKey: SectionNameType | DiagramType,
    agent: Agent,
    onGenerate: () => void,
    isGenerating: boolean,
    isAnythingGenerating: boolean,
    hasCredits: boolean,
    handleProps?: any,
}) => {
    const {
        t,
        title,
        disabledReason,
    } = useSectionAccordionItemLogic(agent); // Pass the full agent object

    const canGenerate = hasCredits && !isAnythingGenerating;

    return (
        <AccordionItem value={itemKey} key={itemKey} className="bg-background border rounded-lg">
            <div className="flex items-center" >
                {handleProps && (
                    <div {...handleProps} className="p-2 cursor-grab touch-none">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>
                )}
                <AccordionTrigger className="flex-1 rounded-md px-4 py-2 text-sm font-medium hover:no-underline">
                    <div className="flex items-center gap-2">
                        {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
                        {title}
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
                                        onClick={onGenerate}
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
