'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Layers, Clock, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/infrastructure/utils/cn';
import { ProjectProperties } from '@/modules/projects/domain/entities/Project';

/**
 * ProjectNodeItem — High-fidelity primitive for project discovery nodes.
 * Features technical metadata (node count, last update) and tactile hover feedback.
 */

interface ProjectNodeItemProps {
    project: ProjectProperties;
    onLoad: (id: string) => void;
    isLoading?: boolean;
    className?: string;
}

export function ProjectNodeItem({
    project,
    onLoad,
    isLoading = false,
    className
}: ProjectNodeItemProps) {
    // Project statistics logic — aligned with domain entities
    const chapterCount = project.content?.length || 0;
    const sectionCount = project.content?.reduce((acc, item: any) => {
        return acc + (item.sections?.length || 0);
    }, 0) || 0;

    const lastUpdated = project.meta?.updated 
        ? formatDistanceToNow(new Date(project.meta.updated), { addSuffix: true })
        : 'Unknown';

    return (
        <div 
            onClick={() => !isLoading && onLoad(project.id)}
            className={cn(
                "group relative p-5 rounded-[24px] border transition-all duration-500 cursor-pointer overflow-hidden",
                isLoading 
                    ? "bg-primary/[0.02] border-primary/20 opacity-70" 
                    : "bg-card/40 border-border/40 hover:border-primary/30 hover:bg-muted/5 hover:translate-x-0.5 shadow-sm"
            )}
        >
            <div className="flex flex-col gap-4 relative z-10">
                {/* Identity Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="h-11 w-11 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 group-hover:border-primary/30 transition-colors relative">
                            <BookOpen className="h-5 w-5 text-primary/60 group-hover:text-primary transition-all group-hover:scale-110" />
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-2xl backdrop-blur-sm">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-[14px] font-black uppercase tracking-tight text-foreground/90 truncate group-hover:text-primary transition-colors">
                                {project.name || 'Untitled Project'}
                            </h4>
                            <div className="flex items-center gap-2.5 mt-1 opacity-40 group-hover:opacity-60 transition-opacity">
                                <Clock className="h-2.5 w-2.5" />
                                <span className="text-[8px] font-black uppercase tracking-widest tabular-nums">Sync {lastUpdated}</span>
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0 pt-1">
                        <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums px-2.5 rounded-full shadow-inner uppercase tracking-widest">
                            v2.4 VECTOR
                        </Badge>
                    </div>
                </div>

                {/* Cognitive Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/40 border border-primary/5">
                        <Layers className="h-3 w-3 text-primary/40" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-foreground/80 tabular-nums leading-none">{chapterCount}</span>
                            <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/60">Chapters</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/40 border border-primary/5">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-foreground/80 tabular-nums leading-none">{sectionCount}</span>
                            <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/60">Active Nodes</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center text-[8px] text-primary font-black uppercase tracking-[0.25em] opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0 pt-1">
                    Restore Core Session <ArrowRight className="h-3 w-3 ml-1.5" />
                </div>
            </div>

            {/* Atmospheric Background Decoration */}
            <div className="absolute -bottom-4 -right-4 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-700 pointer-events-none group-hover:scale-110">
                <BookOpen className="h-24 w-24" />
            </div>
        </div>
    );
}
