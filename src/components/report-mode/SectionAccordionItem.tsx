
'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { buttonVariants } from '@/components/ui/button';
import { Loader2, Sparkles, GripVertical, SlidersHorizontal, StickyNote, Link as LinkIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSectionAccordionItemLogic } from '@/hooks/core/useSectionAccordionItemLogic';
import type { Section } from '@/lib/models';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SectionGenerationControls } from './SectionGenerationControls';
import { GuidelineEditor } from './SectionGuidelineEditor';
import { useAuth } from '@/context/AuthContext';
import { ContextSelector } from './SectionContextSelector';
import { cn } from '@/lib/utils/cn';

export const SectionAccordionItem = ({
    itemKey,
    section,
    onGenerate,
    isGenerating,
    isAnythingGenerating,
    hasCredits,
    handleProps,
    index,
}: {
    itemKey: string,
    section: Section,
    onGenerate: () => void,
    isGenerating: boolean,
    isAnythingGenerating: boolean,
    hasCredits: boolean,
    handleProps?: any,
    index: number,
}) => {
    const {
        t,
    } = useSectionAccordionItemLogic(section);

    const { userProfile } = useAuth();

    const canGenerate = hasCredits && !isAnythingGenerating;

    const handleGenerateClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (canGenerate) {
            onGenerate();
        }
    };

    return (
        <AccordionItem value={itemKey} key={itemKey} className="bg-background border rounded-lg">
            <AccordionTrigger className="flex items-center w-full px-4 py-2 text-sm font-medium hover:no-underline rounded-t-lg">
                <div className="flex items-center gap-2 flex-1">
                    {handleProps && (
                        <div {...handleProps} className="p-1 cursor-grab touch-none -ml-2 flex items-center gap-1 text-muted-foreground">
                            <span className="text-xs w-4 text-center">{index + 1}</span>
                            <GripVertical className="h-5 w-5" />
                        </div>
                    )}
                    {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span className="font-medium">{section.title}</span>

                </div>
                <div className="p-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    onClick={handleGenerateClick}
                                    className={cn(
                                        buttonVariants({ size: 'sm' }),
                                        'font-headline flex items-center',
                                        !canGenerate ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                    )}
                                >
                                    {isGenerating ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                                    {t('builder.reportGenerator.generateButton')}
                                </div>
                            </TooltipTrigger>
                            {!canGenerate && (
                                <TooltipContent>
                                    <p>{isAnythingGenerating ? "Another generation is in progress." : "Insufficient credits."}</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="border-t px-4 pt-4">
                    <Tabs defaultValue="controls" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="controls"><SlidersHorizontal className="me-2 h-4 w-4" />{t('builder.reportGenerator.tool_tab_controls')}</TabsTrigger>
                            <TabsTrigger value="prompt"><StickyNote className="me-2 h-4 w-4" />{t('builder.reportGenerator.tool_tab_prompt')}</TabsTrigger>
                            <TabsTrigger value="context"><LinkIcon className="me-2 h-4 w-4" />{t('builder.reportGenerator.tool_tab_context')}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="controls" className="py-4">
                            <SectionGenerationControls sectionKey={itemKey} />
                        </TabsContent>
                        <TabsContent value="prompt" className="py-4">
                            <GuidelineEditor itemKey={itemKey} />
                        </TabsContent>
                        <TabsContent value="context" className="py-4">
                            <ContextSelector itemKey={itemKey} />
                        </TabsContent>
                    </Tabs>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};
