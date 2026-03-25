
'use client';

import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { cn } from '@/lib/utils/cn';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Link as LinkIcon, Loader2, SlidersHorizontal, Sparkles, StickyNote } from 'lucide-react';
import React from 'react';
import { Checkbox } from '../../ui/checkbox';
import { SectionContextSelector } from '../section-controls/SectionContextSelector';
import { SectionGenerationControls } from '../section-controls/SectionGenerationControls';
import { GuidelineEditor } from '../section-controls/SectionGuidelineEditor';
import { useAiActions } from '@/hooks/report-mode/use-ai-actions';
import { Section, type Project } from '@/lib/types';


interface SectionAccordionItemProps {
    section: Section;
    chapterIndex: number;
    sectionIndex: number;
    isProjectBuildMode: boolean;
    isSelected: boolean;
    toggleSectionSelection: (sectionId: string) => void;
}

export function SectionAccordionItem({
    section,
    chapterIndex,
    sectionIndex,
    isProjectBuildMode,
    isSelected,
    toggleSectionSelection,
}: SectionAccordionItemProps) {
    const { t } = useLocalization();
    const { userProfile, project } = useBuilderStore();
    
    const { generateSectionMutation, generateChapterMutation, generateProjectMutation } = useAiActions();

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : 0,
        position: 'relative',
    };
    
    if (!section) return null;

    const isGenerating = generateSectionMutation?.isPending && generateSectionMutation.variables === section.id;
    const isAnythingGenerating = generateSectionMutation?.isPending || generateChapterMutation.isPending || generateProjectMutation.isPending;
    const hasCredits = (userProfile?.credits ?? 0) >= 1;
    const canGenerate = hasCredits && !isAnythingGenerating;

    function handleGenerateClick(e: React.MouseEvent) {
        e.stopPropagation();
        if (canGenerate) {
            generateSectionMutation.mutate(section.id);
        }
    }

    const getContextNames = (proj: Project | null, sec: Section): string[] => {
        if (!proj || !sec.context) return [];
    
        const sectionNames = Object.keys(sec.context.sections || {}).map(id => proj?.getSection(id)?.title || 'Untitled Section');
        const fileNames = Object.keys(sec.context.externalContext || {}).map(id => proj?.externalContext?.find(f => f.id === id)?.fileName || 'Untitled File');
    
        return [...sectionNames, ...fileNames];
    };

    const contextNames = getContextNames(project, section);
    const totalContext = contextNames.length;


    return (
        <AccordionItem value={section.id} key={section.id} className="bg-background border rounded-lg overflow-hidden shadow-sm" ref={setNodeRef} style={style} {...attributes}>
            <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-muted/10 border-b">
                {isProjectBuildMode && (
                    <div className="flex items-center gap-2" onClick={(e) => { e.stopPropagation(); toggleSectionSelection(section.id); }}>
                        <Checkbox
                            checked={isSelected}
                            aria-label={`Select section ${section.title}`}
                        />
                    </div>
                )}
                <AccordionTrigger className={cn("flex-1 hover:no-underline py-0 min-w-0", isProjectBuildMode && "ml-2")}>
                    <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0 group">
                        <div {...listeners} className="p-1.5 rounded-md cursor-grab touch-none -ml-2 flex items-center gap-2 text-muted-foreground transition-colors hover:bg-muted/40 shrink-0">
                            <span className="text-[11px] w-8 text-left">{chapterIndex >= 0 ? `${chapterIndex + 1}.${sectionIndex + 1}`: `${sectionIndex + 1}`}</span>
                            <GripVertical className="h-5 w-5" />
                        </div>
                        {isGenerating && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
                        <span className="text-sm font-medium p-0 h-auto truncate break-words group-hover:text-foreground min-w-0">
                            {section.title}
                        </span>
                        {totalContext > 0 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 ml-2 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-primary shrink-0">
                                  <LinkIcon className="h-3.5 w-3.5" />
                                  <span className="text-[11px] font-medium">{totalContext}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <div className="text-xs space-y-1">
                                  {contextNames.map(name => <p key={name}>{name}</p>)}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                    </div>
                </AccordionTrigger>
            </div>
            <AccordionContent>
                <div className="border-t bg-background">
                    <Tabs defaultValue="controls" className="w-full">
                        <div className="px-4 pt-4">
                            <TooltipProvider>
                                <TabsList className="grid w-full grid-cols-3 rounded-lg bg-muted/20 p-1 gap-1">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <TabsTrigger value="controls" className="gap-2 text-[11px] sm:text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm px-2">
                                                <SlidersHorizontal className="h-4 w-4 shrink-0" />
                                                <span className="truncate">Controls</span>
                                            </TabsTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent><p>Controls</p></TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <TabsTrigger value="prompt" className="gap-2 text-[11px] sm:text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm px-2">
                                                <StickyNote className="h-4 w-4 shrink-0" />
                                                <span className="truncate">Prompt</span>
                                            </TabsTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent><p>Edit Prompt</p></TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <TabsTrigger value="context" className="gap-2 text-[11px] sm:text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm px-2">
                                                <LinkIcon className="h-4 w-4 shrink-0" />
                                                <span className="truncate">{t('builder.reportGenerator.tool_tab_context')}</span>
                                            </TabsTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent><p>{t('builder.reportGenerator.tool_tab_context')}</p></TooltipContent>
                                    </Tooltip>
                                </TabsList>
                            </TooltipProvider>
                        </div>
                        <div className="px-4">
                            <TabsContent value="controls" className="py-4">
                                <div className="rounded-lg border bg-card p-4 sm:p-5">
                                    <SectionGenerationControls section={section} />
                                </div>
                            </TabsContent>
                            <TabsContent value="prompt" className="py-4">
                                <div className="rounded-lg border bg-card p-4 sm:p-5">
                                    <GuidelineEditor itemKey={section.id} />
                                </div>
                            </TabsContent>
                            <TabsContent value="context" className="py-4">
                                <div className="rounded-lg border bg-card p-4 sm:p-5">
                                    <SectionContextSelector sectionId={section.id} />
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                    <div className="p-4 border-t border-border/60 bg-muted/20 rounded-b-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
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
