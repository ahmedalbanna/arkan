
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
import { ContextSelector } from './SectionContextSelector';
import { SectionGenerationControls } from './SectionGenerationControls';
import { GuidelineEditor } from './SectionGuidelineEditor';
import { Checkbox } from '../ui/checkbox';
import { cn } from '@/lib/utils/cn';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Simplified props, as the component now gets most data from hooks
interface SectionAccordionItemProps {
    sectionId: string;
    chapterIndex: number;
    sectionIndex: number;
    isProjectBuildMode: boolean; // Is the parent in project-build mode?
}

export function SectionAccordionItem({
    sectionId,
    chapterIndex,
    sectionIndex,
    isProjectBuildMode,
}: SectionAccordionItemProps) {
    const { t } = useLocalization();
    // Fetch all necessary data and actions from the global store
    const { 
        project, 
        sectionMutation, 
        onGenerateSection, 
        userProfile, 
        isAnythingGenerating,
        selectedSectionsForBuild,
        handleSectionSelectionToggle,
    } = useBuilderStore(state => ({
        project: state.project,
        sectionMutation: state.sectionMutation,
        onGenerateSection: state.onGenerateSection,
        userProfile: state.userProfile,
        isAnythingGenerating: state.sectionMutation.isPending || state.chapterMutation.isPending,
        selectedSectionsForBuild: state.selectedSectionsForBuild,
        handleSectionSelectionToggle: state.handleSectionSelectionToggle,
    }));

    const section = project?.getSection(sectionId);
    
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sectionId });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : 0,
        position: 'relative',
    };
    
    if (!section) return null; // Or render a skeleton/error state

    const isGenerating = sectionMutation.isPending && sectionMutation.variables === sectionId;
    const hasCredits = (userProfile?.credits ?? 0) >= 1;
    const canGenerate = hasCredits && !isAnythingGenerating;
    const isSelected = selectedSectionsForBuild.has(sectionId);

    function handleGenerateClick(e: React.MouseEvent) {
        e.stopPropagation();
        if (canGenerate) {
            onGenerateSection(sectionId);
        }
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <AccordionItem value={sectionId} key={sectionId} className="bg-background border rounded-lg">
                <div className="flex items-center px-4 py-2">
                    {isProjectBuildMode && (
                        <div className="flex items-center gap-2" onClick={(e) => { e.stopPropagation(); handleSectionSelectionToggle(sectionId); }}>
                            <Checkbox
                                checked={isSelected}
                                aria-label={`Select section ${section.title}`}
                            />
                        </div>
                    )}
                    <AccordionTrigger className={cn("flex-1 hover:no-underline py-0", isProjectBuildMode && "ml-2")}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                             <div {...listeners} className="p-1 cursor-grab touch-none -ml-2 flex items-center gap-1 text-muted-foreground">
                                <span className="text-xs w-8 text-left">{chapterIndex >= 0 ? `${chapterIndex + 1}.${sectionIndex + 1}`: `${sectionIndex + 1}`}</span>
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
                                     <GuidelineEditor sectionId={section.id} />
                                </TabsContent>
                                <TabsContent value="context" className="py-4">
                                    <ContextSelector sectionId={section.id} />
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
                </AccordionContent>
            </AccordionItem>
        </div>
    );
}
