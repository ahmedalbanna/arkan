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
    onActivate: (sectionId: string) => void;
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

    const handleActivate = () => onActivate(section.id);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={cn(
                "bg-background border rounded-lg overflow-hidden shadow-sm transition-shadow",
                isActive && "ring-2 ring-primary/30 shadow-md"
            )}
        >
            <div
                className={cn(
                    "flex flex-wrap items-center gap-2 px-4 py-3 bg-muted/10 border-b cursor-pointer",
                    isActive && "bg-primary/5"
                )}
                onClick={handleActivate}
            >
                {isProjectBuildMode && (
                    <div className="flex items-center gap-2" onClick={(e) => { e.stopPropagation(); toggleSectionSelection(section.id); }}>
                        <Checkbox
                            checked={isSelected}
                            aria-label={`Select section ${section.title}`}
                        />
                    </div>
                )}
                <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0 group">
                    <div {...listeners} className="p-1.5 rounded-md cursor-grab touch-none -ml-2 flex items-center gap-2 text-muted-foreground transition-colors hover:bg-muted/40 shrink-0">
                        <span className="text-[11px] w-8 text-left">{chapterIndex >= 0 ? `${chapterIndex + 1}.${sectionIndex + 1}` : `${sectionIndex + 1}`}</span>
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
            </div>
        </div>
    );
};
