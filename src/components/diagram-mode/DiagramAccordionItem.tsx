

'use client';

import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { type DiagramType } from '@/ai/schemas';
import { Loader2, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSectionAccordionItemLogic } from '@/hooks';

export const DiagramAccordionItem = ({
    diagramType,
    onGenerate,
    isGenerating,
    hasCredits,
}: {
    diagramType: DiagramType,
    onGenerate: (section: DiagramType) => void,
    isGenerating: boolean,
    hasCredits: boolean,
}) => {
    const {
        t,
        title,
        Icon,
        disabledReason,
    } = useSectionAccordionItemLogic(diagramType);

    // Context is now handled automatically by the AI, so we always enable generation if credits are available.
    const canGenerate = hasCredits;

    return (
        <AccordionItem value={diagramType} key={diagramType}>
            <div className="flex items-center rounded-md hover:bg-muted" >
                <AccordionTrigger className="flex-1 rounded-md px-4 py-2 text-sm font-medium hover:no-underline">
                    <div className="flex items-center gap-2">
                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon />}
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
                                        onClick={() => onGenerate(diagramType)}
                                        disabled={isGenerating || !canGenerate}
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
            <AccordionContent className="space-y-4 p-4 text-xs text-muted-foreground">
              {t('builder.diagramGenerator.autoContextNote')}
            </AccordionContent>
        </AccordionItem>
    );
};
