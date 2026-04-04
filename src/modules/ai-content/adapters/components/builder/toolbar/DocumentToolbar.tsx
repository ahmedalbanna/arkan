'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, PenLine, ListTree, Maximize2, Minimize2, Lightbulb, BookOpen, Clock } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';
import { Project } from '@/modules/projects/domain/entities/Project';

interface DocumentToolbarProps {
    project: Project | null;
    viewMode: 'edit' | 'preview';
    setViewMode: (mode: 'edit' | 'preview') => void;
    isOutlineVisible: boolean;
    setIsOutlineVisible: (visible: boolean) => void;
    isFullscreen: boolean;
    toggleFullscreen: () => void;
    suggestion: string;
    showCoverPage: boolean;
    setShowCoverPage: (visible: boolean) => void;
    className?: string;
}

export const DocumentToolbar = ({
    project,
    viewMode,
    setViewMode,
    isOutlineVisible,
    setIsOutlineVisible,
    isFullscreen,
    toggleFullscreen,
    suggestion,
    showCoverPage,
    setShowCoverPage,
    className,
}: DocumentToolbarProps) => {
    return (
        <div className={cn(
            "flex items-center justify-between px-6 py-2.5 bg-background/60 backdrop-blur-2xl border-b border-primary/10 sticky top-0 z-[40] transition-all duration-500",
            className
        )}>
            {/* Left — status indicators */}
            <div className="flex items-center gap-4">
                {/* Live Preview badge */}
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] bg-background/40 px-3 py-1.5 rounded-full border border-primary/10 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                    System Active
                </div>

                {/* Divider */}
                <div className="w-px h-5 bg-primary/10" aria-hidden />

                {/* Auto-save timestamp */}
                {project?.meta.updated ? (
                    <div className="flex items-center gap-2 group/time">
                        <Clock className="h-3 w-3 text-primary/40 group-hover/time:text-primary transition-colors" />
                        <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-[0.15em] tabular-nums">
                            Saved {formatDistanceToNow(new Date(project.meta.updated), { addSuffix: true })}
                        </span>
                    </div>
                ) : (
                    <span className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-[0.15em]">
                        Standby
                    </span>
                )}
            </div>

            {/* Right — action buttons (Control Group) */}
            <div className="flex items-center gap-1.5 bg-background/20 p-1 rounded-2xl border border-white/5 shadow-inner">
                <TooltipProvider delayDuration={200}>

                    {/* Group 1 — View Selection */}
                    <div className="flex items-center gap-1 px-1 border-r border-primary/10 mr-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-8 w-8 rounded-xl transition-all duration-300",
                                        viewMode === 'edit'
                                            ? "bg-primary/10 text-primary shadow-[0_0_12px_rgba(var(--primary),0.15)] ring-1 ring-primary/20"
                                            : "hover:bg-primary/5 hover:text-primary text-muted-foreground opacity-60 hover:opacity-100"
                                    )}
                                    onClick={() => setViewMode('edit')}
                                >
                                    <PenLine className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[10px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mt-3">
                                Edit Mode <span className="opacity-50 ml-2 font-normal normal-case tracking-normal">Ctrl E</span>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-8 w-8 rounded-xl transition-all duration-300",
                                        viewMode === 'preview'
                                            ? "bg-primary/10 text-primary shadow-[0_0_12px_rgba(var(--primary),0.15)] ring-1 ring-primary/20"
                                            : "hover:bg-primary/5 hover:text-primary text-muted-foreground opacity-60 hover:opacity-100"
                                    )}
                                    onClick={() => setViewMode('preview')}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[10px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mt-3">
                                Preview Mode <span className="opacity-50 ml-2 font-normal normal-case tracking-normal">Ctrl P</span>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Group 2 — Structure HUDs */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-8 w-8 rounded-xl transition-all duration-300",
                                    isOutlineVisible
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "hover:bg-primary/5 hover:text-primary text-muted-foreground"
                                )}
                                onClick={() => setIsOutlineVisible(!isOutlineVisible)}
                            >
                                <ListTree className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-[10px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mt-3">
                            Toggle Outline
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-8 w-8 rounded-xl transition-all duration-300",
                                    showCoverPage
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "hover:bg-primary/5 hover:text-primary text-muted-foreground"
                                )}
                                onClick={() => setShowCoverPage(!showCoverPage)}
                            >
                                <BookOpen className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-[10px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mt-3">
                            Toggle Cover Page
                        </TooltipContent>
                    </Tooltip>

                    {/* Group 3 — Immersion */}
                    <div className="flex items-center gap-1 px-1 border-l border-primary/10 ml-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-xl hover:bg-primary/5 hover:text-primary text-muted-foreground transition-all duration-300"
                                    onClick={toggleFullscreen}
                                >
                                    {isFullscreen
                                        ? <Minimize2 className="h-4 w-4" />
                                        : <Maximize2 className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[10px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mt-3">
                                {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                                <span className="opacity-50 ml-2 font-normal normal-case tracking-normal">F11</span>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-[10px] font-black uppercase tracking-[0.15em] gap-2 px-3 rounded-xl hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 text-muted-foreground transition-all duration-300"
                                >
                                    <Lightbulb className="h-4 w-4 text-amber-500" />
                                    Guide
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent
                                side="bottom"
                                className="max-w-[280px] p-5 space-y-3 bg-background/95 backdrop-blur-2xl border-primary/20 mt-3 shadow-2xl"
                            >
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                    Intelligent Suggestion
                                </p>
                                <p className="text-[12px] leading-relaxed text-muted-foreground italic font-medium">
                                    {suggestion}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                </TooltipProvider>
            </div>
        </div>
    );
};
