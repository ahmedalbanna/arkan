'use client';

import React from 'react';
import { Project } from '@/modules/projects/domain/entities/Project';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, PenLine, ListTree, Maximize2, Minimize2, Lightbulb } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';

interface DocumentToolbarProps {
    project: Project | null;
    viewMode: 'edit' | 'preview';
    setViewMode: (mode: 'edit' | 'preview') => void;
    isOutlineVisible: boolean;
    setIsOutlineVisible: (visible: boolean) => void;
    isFullscreen: boolean;
    toggleFullscreen: () => void;
    suggestion: string;
}

export const DocumentToolbar = ({
    project,
    viewMode,
    setViewMode,
    isOutlineVisible,
    setIsOutlineVisible,
    isFullscreen,
    toggleFullscreen,
    suggestion
}: DocumentToolbarProps) => {
    return (
        <div className="flex items-center justify-between px-6 py-2.5 border-b bg-muted/10 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-background/50 px-2 py-1 rounded-md border border-border/40 shadow-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    Live Preview
                </div>
                {project?.meta.updated && (
                    <span className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-tighter">
                        Last auto-save: {formatDistanceToNow(new Date(project.meta.updated), { addSuffix: true })}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-7 w-7 transition-all duration-300",
                                    viewMode === 'edit' ? "bg-primary/10 text-primary" : "hover:bg-primary/5 hover:text-primary"
                                )}
                                onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
                            >
                                {viewMode === 'edit' ? <Eye className="h-3.5 w-3.5" /> : <PenLine className="h-3.5 w-3.5" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-[10px] font-bold uppercase tracking-widest">
                            {viewMode === 'edit' ? "Switch to Preview" : "Switch to Edit"}
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-7 w-7 transition-all duration-300",
                                    isOutlineVisible ? "bg-primary/10 text-primary" : "hover:bg-primary/5 hover:text-primary"
                                )}
                                onClick={() => setIsOutlineVisible(!isOutlineVisible)}
                            >
                                <ListTree className="h-3.5 w-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-[10px] font-bold uppercase tracking-widest">
                            Toggle Document Outline
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-primary/5 hover:text-primary"
                                onClick={toggleFullscreen}
                            >
                                {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-[10px] font-bold uppercase tracking-widest">
                            {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-wider gap-2 px-2 hover:bg-primary/5 hover:text-primary">
                                <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
                                Writer's Guide
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs p-4 space-y-2">
                            <p className="font-bold text-xs uppercase tracking-widest text-primary">Intelligent Suggestion</p>
                            <p className="text-[11px] leading-relaxed italic">{suggestion}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
};
