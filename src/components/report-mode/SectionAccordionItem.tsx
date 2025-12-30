
'use client';

import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import type { Section } from '@/lib/models';
import { GripVertical, Link as LinkIcon, Loader2, SlidersHorizontal, Sparkles, StickyNote } from 'lucide-react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ContextSelector } from './SectionContextSelector';
import { SectionGenerationControls } from './SectionGenerationControls';
import { GuidelineEditor } from './SectionGuidelineEditor';
import { Checkbox } from '../ui/checkbox';
import { cn } from '@/lib/utils/cn';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


export function SectionAccordionItem({
    section,
    onGenerate,
    isGenerating,
    isAnythingGenerating,
    hasCredits,
    index,
    chapterIndex,
    isSelected,
    onSelect,
    isCheckboxVisible
}: {
    section: Section,
    onGenerate: () => void,
    isGenerating: boolean,
    isAnythingGenerating: boolean,
    hasCredits: boolean,
    index: number,
    chapterIndex: number,
    isSelected: boolean,
    onSelect: () => void;
    isCheckboxVisible: boolean;
}) {
    const { t } = useLocalization();
    const { updateProject } = useBuilderStore();
    const form = useForm();
    const itemKey = section.id;

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: itemKey });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : 0,
        position: 'relative',
    };

    const canGenerate = hasCredits && !isAnythingGenerating;

    function handleGenerateClick(e: React.MouseEvent) {
        e.stopPropagation();
        if (canGenerate) {
            onGenerate();
        }
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <AccordionItem value={itemKey} key={itemKey} className="bg-background border rounded-lg">
                <div className="flex items-center px-4 py-2">
                    {isCheckboxVisible && (
                        <div className="flex items-center gap-2" onClick={(e) => { e.stopPropagation(); onSelect(); }}>
                            <Checkbox
                                checked={isSelected}
                                aria-label={`Select section ${section.title}`}
                            />
                        </div>
                    )}
                    <AccordionTrigger className={cn("flex-1 hover:no-underline py-0", isCheckboxVisible && "ml-2")}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                             <div {...listeners} className="p-1 cursor-grab touch-none -ml-2 flex items-center gap-1 text-muted-foreground">
                                <span className="text-xs w-8 text-left">{chapterIndex >= 0 ? `${chapterIndex + 1}.${index + 1}`: `${index + 1}`}</span>
                                <GripVertical className="h-5 w-5" />
                            </div>
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
                                                <TooltipContent><p>Controls</p></TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <TabsTrigger value="prompt"><StickyNote className="h-4 w-4" /></TabsTrigger>
                                                </TooltipTrigger>
                                                <TooltipContent><p>Edit Prompt</p></TooltipContent>
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
                                    <TabsContent value="controls" className="py-4 space-y-6">
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
        </div>
    );
}
