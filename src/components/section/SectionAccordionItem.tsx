
'use client';

import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type SectionName as SectionNameType } from '@/ai/schemas';
import { Loader2, Sparkles, FileText, GripVertical } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GuidelineEditor } from './SectionGuidelineEditor';
import { ContextSelector } from './SectionContextSelector';
import { SectionGenerationControls } from './SectionGenerationControls';
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
        agentId,
        Icon,
        userProfile,
        hasSelectedContext,
        disabledReason,
    } = useSectionAccordionItemLogic(sectionKey, hasCredits);


    return (
        <AccordionItem value={sectionKey} key={sectionKey}>
            <div className="flex items-center rounded-md hover:bg-muted" >
                {handleProps && (
                    <div {...handleProps} className="p-2 cursor-grab touch-none">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>
                )}
                <AccordionTrigger className="flex-1 rounded-md px-4 py-2 text-sm font-medium hover:no-underline">
                    <div className="flex items-center gap-2">
                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon />}
                        {t(title)}
                    </div>
                </AccordionTrigger>
            </div>
            <AccordionContent className="space-y-4 p-4">
                <Tabs defaultValue="prompt" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="prompt">{t('builder.reportGenerator.tool_tab_prompt')}</TabsTrigger>
                        <TabsTrigger value="controls">{t('builder.reportGenerator.tool_tab_controls')}</TabsTrigger>
                        <TabsTrigger value="context">{t('builder.reportGenerator.tool_tab_context')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="prompt" className="pt-4 space-y-4">
                        <GuidelineEditor itemKey={sectionKey} agentId={agentId} isAdmin={userProfile?.role === 'admin'} />
                    </TabsContent>
                    <TabsContent value="controls" className="pt-4">
                        <SectionGenerationControls sectionKey={sectionKey} />
                    </TabsContent>
                    <TabsContent value="context" className="pt-4">
                        <ContextSelector itemKey={sectionKey} />
                    </TabsContent>
                </Tabs>
                <div className="pt-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="w-full">
                                    <Button
                                        type="button"
                                        onClick={() => onGenerate(sectionKey)}
                                        disabled={isAnythingGenerating || !hasSelectedContext || !hasCredits}
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
