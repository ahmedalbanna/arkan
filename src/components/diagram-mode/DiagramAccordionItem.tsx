
'use client';

import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type DiagramType } from '@/ai/schemas';
import { Loader2, Sparkles, FileText, GripVertical } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ContextSelector } from '../section/SectionContextSelector';
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
        hasSelectedContext,
        disabledReason,
    } = useSectionAccordionItemLogic(diagramType);

    return (
        <AccordionItem value={diagramType} key={diagramType}>
            <div className="flex items-center rounded-md hover:bg-muted" >
                <AccordionTrigger className="flex-1 rounded-md px-4 py-2 text-sm font-medium hover:no-underline">
                    <div className="flex items-center gap-2">
                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon />}
                        {t(title)}
                    </div>
                </AccordionTrigger>
            </div>
            <AccordionContent className="space-y-4 p-4">
                <Tabs defaultValue="context" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="controls">{t('builder.reportGenerator.tool_tab_controls')}</TabsTrigger>
                        <TabsTrigger value="context">{t('builder.reportGenerator.tool_tab_context')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="controls" className="pt-4">
                        <p className="text-xs text-muted-foreground">Controls for this diagram type can be added here in the future.</p>
                    </TabsContent>
                    <TabsContent value="context" className="pt-4">
                        <ContextSelector itemKey={diagramType} />
                    </TabsContent>
                </Tabs>
                <div className="pt-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="w-full">
                                    <Button
                                        type="button"
                                        onClick={() => onGenerate(diagramType)}
                                        disabled={isGenerating || !hasSelectedContext || !hasCredits}
                                        className="font-headline w-full"
                                    >
                                        {isGenerating ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                                        {`${t('builder.reportGenerator.generateButton')} ${t(title)}`}
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
            </AccordionContent>
        </AccordionItem>
    );
};
