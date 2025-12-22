'use client';

import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import type { Section } from '@/lib/models';
import { GripVertical, Link as LinkIcon, Loader2, SlidersHorizontal, Sparkles, StickyNote, Trash2 } from 'lucide-react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ContextSelector } from './SectionContextSelector';
import { SectionGenerationControls } from './SectionGenerationControls';
import { GuidelineEditor } from './SectionGuidelineEditor';


export function SectionAccordionItem({
    itemKey,
    section,
    onGenerate,
    isGenerating,
    isAnythingGenerating,
    hasCredits,
    handleProps,
    index,
    chapterIndex,
    onDelete,
}: {
    itemKey: string,
    section: Section,
    onGenerate: () => void,
    isGenerating: boolean,
    isAnythingGenerating: boolean,
    hasCredits: boolean,
    handleProps?: any,
    index: number,
    chapterIndex: number,
    onDelete: () => void;
}) {
    const { t } = useLocalization();
    const { updateProject } = useBuilderStore();
    const form = useForm();

    const canGenerate = hasCredits && !isAnythingGenerating;

    function handleGenerateClick(e: React.MouseEvent) {
        e.stopPropagation();
        if (canGenerate) {
            onGenerate();
        }
    }

    return (
        <AccordionItem value={itemKey} key={itemKey} className="bg-background border rounded-lg">
            <div className="flex items-center px-4 py-2">
                <AccordionTrigger className="flex-1 hover:no-underline py-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {handleProps && (
                            <div {...handleProps} className="p-1 cursor-grab touch-none -ml-2 flex items-center gap-1 text-muted-foreground">
                                <span className="text-xs w-8 text-left">{chapterIndex + 1}.{index + 1}</span>
                                <GripVertical className="h-5 w-5" />
                            </div>
                        )}
                        {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
                        <span className="font-medium p-0 h-auto truncate">
                            {section.title}
                        </span>
                    </div>
                </AccordionTrigger>
            </div>
            <AccordionContent>
                <FormProvider {...form}>
                    <div className="border-t">
                        <Tabs defaultValue="controls" className="w-full">
                            <div className="px-4 pt-4">
                                <TooltipProvider>
                                    <TabsList className="grid w-full grid-cols-3">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <TabsTrigger value="controls"><SlidersHorizontal className="h-4 w-4" /></TabsTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent><p>{t('builder.reportGenerator.tool_tab_controls')}</p></TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <TabsTrigger value="prompt"><StickyNote className="h-4 w-4" /></TabsTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent><p>{t('builder.reportGenerator.tool_tab_prompt')}</p></TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <TabsTrigger value="context"><LinkIcon className="h-4 w-4" /></TabsTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent><p>{t('builder.reportGenerator.tool_tab_context')}</p></TooltipContent>
                                        </Tooltip>
                                    </TabsList>
                                </TooltipProvider>
                            </div>
                            <div className="px-4">
                                <TabsContent value="controls" className="py-4">
                                    <SectionGenerationControls section={section} />
                                </TabsContent>
                                <TabsContent value="prompt" className="py-4">
                                    <GuidelineEditor itemKey={itemKey} />
                                </TabsContent>
                                <TabsContent value="context" className="py-4">
                                    <ContextSelector itemKey={itemKey} />
                                </TabsContent>
                            </div>
                        </Tabs>
                        <div className="p-4 border-t">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            onClick={handleGenerateClick}
                                            disabled={!canGenerate}
                                            className='w-full'
                                        >
                                            {isGenerating ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                                            {t('builder.reportGenerator.generateButton')}
                                        </Button>
                                    </TooltipTrigger>
                                    {!canGenerate && (
                                        <TooltipContent>
                                            <p>{isAnythingGenerating ? "Another generation is in progress." : "Insufficient credits."}</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </FormProvider>
            </AccordionContent>
        </AccordionItem>
    );
}
