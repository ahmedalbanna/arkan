'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBuilderStore } from '@/hooks';
import { useAiActions } from '@/modules/ai-content/adapters/hooks/report-mode/use-ai-actions';
import { cn } from '@/infrastructure/utils/cn';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Link as LinkIcon, Loader2 } from 'lucide-react';
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { type Project } from '@/modules/projects/domain/entities/Project';

interface SectionAccordionItemProps {
    section: Section;
    chapterIndex: number;
    sectionIndex: number;
    isProjectBuildMode: boolean;
    isSelected: boolean;
    isActive: boolean;
    onActivate: (sectionId: string, multiSelect?: boolean) => void;
    toggleSectionSelection: (sectionId: string) => void;
}

export function SectionAccordionItem({
    section,
    chapterIndex,
    sectionIndex,
    isProjectBuildMode,
    isSelected,
    isActive,
    onActivate,
    toggleSectionSelection,
}: SectionAccordionItemProps) {
    const { project } = useBuilderStore();

    const { generateSectionMutation } = useAiActions();

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : 0,
        position: 'relative',
    };

    if (!section) return null;

    const isGenerating = generateSectionMutation?.isPending && generateSectionMutation.variables === section.id;

    const getContextNames = (proj: Project | null, sec: Section): string[] => {
        if (!proj || !sec.context) return [];

        const sectionNames = Object.keys(sec.context.sections || {}).map(id => proj?.getSection(id)?.title || 'Untitled Section');
        const fileNames = Object.keys(sec.context.externalContext || {}).map(id => proj?.externalContext?.find(f => f.id === id)?.fileName || 'Untitled File');

        return [...sectionNames, ...fileNames];
    };

    const contextNames = getContextNames(project, section);
    const totalContext = contextNames.length;

    const handleActivate = (e: React.MouseEvent) => {
        onActivate(section.id, e.shiftKey || e.metaKey || e.ctrlKey);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={cn(
                "bg-card border rounded-lg overflow-hidden transition-all duration-200",
                isActive 
                    ? "border-primary shadow-md ring-1 ring-primary/20 -translate-y-[1px]" 
                    : "border-border/60 hover:border-primary/30 shadow-sm"
            )}
        >
            <div
                className={cn(
                    "flex flex-wrap items-center gap-3 px-3 py-2.5 cursor-pointer select-none",
                    isActive ? "bg-primary/[0.03]" : "bg-background hover:bg-muted/5"
                )}
                onClick={handleActivate}
            >
                {isProjectBuildMode && (
                    <div className="flex items-center" onClick={(e) => { e.stopPropagation(); toggleSectionSelection(section.id); }}>
                        <Checkbox
                            checked={isSelected}
                            aria-label={`Select section ${section.title}`}
                            className="h-3.5 w-3.5"
                        />
                    </div>
                )}
                <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0 group">
                    {listeners && (
                        <div {...listeners} className="p-1 rounded-md cursor-grab touch-none flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary shrink-0">
                            <span className="text-[9px] font-bold w-6 text-left opacity-60">
                                {chapterIndex >= 0 ? `${chapterIndex + 1}.${sectionIndex + 1}` : `${sectionIndex + 1}`}
                            </span>
                            <GripVertical className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100" />
                        </div>
                    )}
                    {isGenerating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                    ) : (
                        <div className={cn(
                            "h-1.5 w-1.5 rounded-full shrink-0",
                            isActive ? "bg-primary animate-pulse" : "bg-muted-foreground/20"
                        )} />
                    )}
                    <span className={cn(
                        "text-xs font-semibold truncate flex-1 min-w-0 transition-colors",
                        isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                        {section.title}
                    </span>
                    {totalContext > 0 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-primary shrink-0 ring-1 ring-primary/20">
                                        <LinkIcon className="h-2.5 w-2.5" />
                                        <span className="text-[9px] font-bold">{totalContext}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <div className="text-[10px] font-medium space-y-1">
                                        <p className="border-b border-white/10 pb-1 mb-1 uppercase tracking-wider text-[9px] opacity-70">Linked Context</p>
                                        {contextNames.map(name => <p key={name} className="truncate max-w-[150px]">{name}</p>)}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </div>
        </div>
    );
};
