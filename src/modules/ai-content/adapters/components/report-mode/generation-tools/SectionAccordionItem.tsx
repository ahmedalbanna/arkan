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
                "group/item relative rounded-xl border transition-all duration-300 ease-out hover:translate-x-0.5",
                isActive 
                    ? "border-primary/30 bg-primary/[0.03] shadow-[0_0_20px_rgba(var(--primary),0.08)] ring-1 ring-primary/20 -translate-y-[0.5px]" 
                    : "border-border/40 bg-card/50 hover:border-primary/20 hover:bg-muted/5 shadow-sm"
            )}
        >
            <div
                className={cn(
                    "flex items-center gap-3 px-3 py-1.5 cursor-pointer select-none",
                )}
                onClick={handleActivate}
            >
                {isProjectBuildMode && (
                    <div className="flex items-center shrink-0" onClick={(e) => { e.stopPropagation(); toggleSectionSelection(section.id); }}>
                        <Checkbox
                            checked={isSelected}
                            aria-label={`Select section ${section.title}`}
                            className="h-3.5 w-3.5 rounded-sm border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                    </div>
                )}
                
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {listeners && (
                        <div 
                            {...listeners} 
                            className="flex items-center gap-1.5 text-muted-foreground/40 transition-colors hover:text-primary shrink-0 cursor-grab active:cursor-grabbing"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] w-6 text-center tabular-nums opacity-60">
                                {chapterIndex >= 0 ? `${chapterIndex + 1}.${sectionIndex + 1}` : `${sectionIndex + 1}`}
                            </span>
                            <GripVertical className="h-3.5 w-3.5 opacity-50 group-hover/item:opacity-100 transition-opacity" />
                        </div>
                    )}

                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {isGenerating ? (
                            <div className="relative shrink-0">
                                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                <div className="absolute inset-0 blur-sm bg-primary/20 animate-pulse rounded-full" />
                            </div>
                        ) : (
                            <div className={cn(
                                "h-1.5 w-1.5 rounded-full shrink-0 transition-all duration-500",
                                isActive ? "bg-primary scale-125 shadow-[0_0_8px_rgba(var(--primary),0.6)]" : "bg-muted-foreground/20"
                            )} />
                        )}
                        
                        <span className={cn(
                            "text-[11px] font-bold tracking-tight truncate flex-1 transition-colors duration-300",
                            isActive ? "text-foreground" : "text-muted-foreground/80 group-hover/item:text-foreground"
                        )}>
                            {section.title}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        {totalContext > 0 && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div 
                                            className={cn(
                                                "flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary ring-1 ring-primary/20 hover:bg-primary/20 transition-colors",
                                                isActive && "animate-pulse"
                                            )}
                                        >
                                            <LinkIcon className="h-2.5 w-2.5" />
                                            <span className="text-[9px] font-bold tabular-nums">{totalContext}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="border-primary/20 bg-background/95 backdrop-blur-md">
                                        <div className="text-[10px] font-medium space-y-1.5 p-1">
                                            <p className="border-b border-primary/10 pb-1 mb-1.5 uppercase tracking-[0.2em] text-[8px] font-black text-primary">Linked Context</p>
                                            {contextNames.map((name, i) => (
                                                <div key={name + i} className="flex items-center gap-2 max-w-[180px]">
                                                    <div className="h-1 w-1 rounded-full bg-primary/40" />
                                                    <span className="truncate">{name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
