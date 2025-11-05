
'use client';

import React, { useState, useEffect } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button, buttonVariants } from '@/components/ui/button';
import { Loader2, Sparkles, GripVertical, SlidersHorizontal, StickyNote, Link as LinkIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSectionAccordionItemLogic } from '@/hooks/core/useSectionAccordionItemLogic';
import type { Section } from '@/lib/models';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SectionGenerationControls } from './SectionGenerationControls';
import { GuidelineEditor } from './SectionGuidelineEditor';
import { ContextSelector } from './SectionContextSelector';
import { cn } from '@/lib/utils/cn';
import { Form } from '../ui/form';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { useBuilderStore } from '@/hooks';

export const SectionAccordionItem = ({
    itemKey,
    section,
    onGenerate,
    isGenerating,
    isAnythingGenerating,
    hasCredits,
    handleProps,
    index,
    chapterIndex,
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
}) => {
    const { t } = useSectionAccordionItemLogic(section);
    const { updateProject } = useBuilderStore();
    const [title, setTitle] = useState(section.title);

    const form = useForm(); 

    useEffect(() => {
        setTitle(section.title);
    }, [section.title]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    const handleTitleBlur = () => {
        if (title !== section.title) {
            updateProject(p => p.updateSectionTitle(section.id, title));
        }
    };
    
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
                             <span className="text-xs w-8 text-left">{chapterIndex + 1}.{index + 1}</span>
                            <GripVertical className="h-5 w-5" />
                        </div>
                    )}
                    {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Input 
                        value={title}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        onClick={(e) => e.stopPropagation()} // Prevent accordion from toggling when clicking input
                        className="font-medium border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto bg-transparent"
                    />
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="border-t px-4 pt-4">
                    <Form {...form}>
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
                    </Form>
                     <div className="p-2 border-t mt-2">
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
            </AccordionContent>
        </AccordionItem>
    );
};
