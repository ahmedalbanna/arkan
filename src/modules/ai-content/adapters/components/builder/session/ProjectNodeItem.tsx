'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMobile } from '@/hooks/util/use-mobile';
import { cn } from '@/infrastructure/utils/cn';
import { ProjectProperties } from '@/modules/projects/domain/entities/Project';
import { formatDistanceToNow } from 'date-fns';
import {
    ArrowRight,
    BookOpen,
    Calendar,
    Clock,
    Copy,
    ExternalLink,
    FileText,
    Layers,
    Loader2,
    MoreVertical,
    Star,
    StarOff,
    Trash2,
    User
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ProjectNodeItemProps {
    project: ProjectProperties;
    onLoad: (id: string) => void;
    onDuplicate?: (id: string) => void;
    onDelete?: (id: string) => void;
    onToggleFavorite?: (id: string, isFavorite: boolean) => void;
    isFavorite?: boolean;
    isLoading?: boolean;
    className?: string;
}

export function ProjectNodeItem({
    project,
    onLoad,
    onDuplicate,
    onDelete,
    onToggleFavorite,
    isFavorite = false,
    isLoading = false,
    className
}: ProjectNodeItemProps) {
    const isDesktop = !useMobile();
    const [isHovered, setIsHovered] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const hoverTimeoutRef = useRef<NodeJS.Timeout>();

    // Project statistics
    const chapterCount = project.content?.length || 0;
    const sectionCount = project.content?.reduce((acc, item: any) => {
        return acc + (item.sections?.length || 0);
    }, 0) || 0;

    const wordCount = project.content?.reduce((acc, item: any) => {
        let words = 0;
        if (item.content) {
            words += item.content.split(/\s+/).filter((w: string) => w.length > 0).length;
        }
        if (item.sections) {
            words += item.sections.reduce((sum: number, section: any) => {
                return sum + (section.content?.split(/\s+/).filter((w: string) => w.length > 0).length || 0);
            }, 0);
        }
        return acc + words;
    }, 0) || 0;

    const lastUpdated = project.meta?.updated
        ? formatDistanceToNow(new Date(project.meta.updated), { addSuffix: true })
        : 'Unknown';

    const createdAt = project.meta?.created
        ? formatDistanceToNow(new Date(project.meta.created), { addSuffix: true })
        : 'Unknown';

    const author = project.meta?.author || 'Unknown';

    // Handle hover with delay
    const handleMouseEnter = useCallback(() => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        hoverTimeoutRef.current = setTimeout(() => {
            setIsHovered(false);
        }, 100);
    }, []);

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        };
    }, []);

    const handleLoad = useCallback(() => {
        if (!isLoading && !isDeleting) {
            onLoad(project.id);
        }
    }, [isLoading, isDeleting, onLoad, project.id]);

    const handleDuplicate = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDuplicate?.(project.id);
    }, [onDuplicate, project.id]);

    const handleDelete = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Delete "${project.name}"? This action cannot be undone.`)) {
            setIsDeleting(true);
            onDelete?.(project.id);
            setTimeout(() => setIsDeleting(false), 500);
        }
    }, [onDelete, project.id, project.name]);

    const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleFavorite?.(project.id, !isFavorite);
    }, [onToggleFavorite, project.id, isFavorite]);

    // Keyboard accessibility
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleLoad();
        }
        if (e.key === 'Delete' && onDelete) {
            e.preventDefault();
            handleDelete(e as any);
        }
    }, [handleLoad, handleDelete, onDelete]);

    return (
        <div
            onClick={handleLoad}
            onKeyDown={handleKeyDown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="button"
            tabIndex={0}
            aria-label={`Open project: ${project.name}`}
            className={cn(
                "group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                isLoading || isDeleting
                    ? "bg-primary/[0.02] border-primary/20 opacity-70"
                    : "bg-card/40 border-border/40 hover:border-primary/30 hover:bg-muted/5 hover:shadow-md active:scale-[0.98]",
                isDesktop && "hover:-translate-y-0.5",
                className
            )}
        >
            {/* Loading/Deleting Overlay */}
            {(isLoading || isDeleting) && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20 rounded-2xl">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            )}

            <div className="flex flex-col gap-4 relative z-10">
                {/* Header Section */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Project Icon */}
                        <div className="relative shrink-0">
                            <div className={cn(
                                "h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-300",
                                "bg-primary/5 border border-primary/10",
                                isDesktop && "group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:scale-105"
                            )}>
                                <BookOpen className="h-5 w-5 text-primary/60 group-hover:text-primary transition-all" />
                            </div>

                            {/* Favorite Star Indicator */}
                            {isFavorite && (
                                <div className="absolute -top-1 -right-1">
                                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                </div>
                            )}
                        </div>

                        {/* Project Info */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-[14px] font-black uppercase tracking-tight text-foreground/90 truncate group-hover:text-primary transition-colors">
                                    {project.name || 'Untitled Project'}
                                </h4>
                                {isDesktop && project.version && (
                                    <Badge variant="outline" className="h-4 text-[7px] font-mono border-primary/20 bg-primary/5">
                                        v{project.version}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center gap-3 mt-1 opacity-40 group-hover:opacity-60 transition-opacity">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5" />
                                    <span className="text-[8px] font-black uppercase tracking-widest tabular-nums">
                                        Updated {lastUpdated}
                                    </span>
                                </div>
                                {isDesktop && (
                                    <>
                                        <div className="h-1 w-1 rounded-full bg-primary/20" />
                                        <div className="flex items-center gap-1">
                                            <User className="h-2.5 w-2.5" />
                                            <span className="text-[8px] font-black uppercase tracking-widest">
                                                {author}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - Desktop */}
                    {isDesktop && !isLoading && !isDeleting && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleToggleFavorite}
                                            className="h-7 w-7 rounded-lg hover:bg-amber-500/10"
                                        >
                                            {isFavorite ? (
                                                <StarOff className="h-3.5 w-3.5 text-amber-500" />
                                            ) : (
                                                <Star className="h-3.5 w-3.5 text-muted-foreground/40" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-[8px]">
                                        {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-lg"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MoreVertical className="h-3.5 w-3.5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                                    {onDuplicate && (
                                        <DropdownMenuItem onClick={handleDuplicate} className="text-[10px]">
                                            <Copy className="h-3 w-3 mr-2" />
                                            Duplicate
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                        onClick={() => window.open(`/builder/${project.id}`, '_blank')}
                                        className="text-[10px]"
                                    >
                                        <ExternalLink className="h-3 w-3 mr-2" />
                                        Open in new tab
                                    </DropdownMenuItem>
                                    {onDelete && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={handleDelete}
                                                className="text-[10px] text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="h-3 w-3 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/40 border border-primary/5 group/stat">
                        <Layers className="h-3 w-3 text-primary/40 group-hover/stat:text-primary/60 transition-colors" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-foreground/80 tabular-nums leading-none">{chapterCount}</span>
                            <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/60">
                                Chapter{chapterCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/40 border border-primary/5 group/stat">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-foreground/80 tabular-nums leading-none">{sectionCount}</span>
                            <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/60">
                                Section{sectionCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/40 border border-primary/5 group/stat">
                        <FileText className="h-3 w-3 text-primary/40 group-hover/stat:text-primary/60 transition-colors" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-foreground/80 tabular-nums leading-none">
                                {wordCount >= 1000 ? `${(wordCount / 1000).toFixed(1)}k` : wordCount}
                            </span>
                            <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/60">
                                Words
                            </span>
                        </div>
                    </div>
                </div>

                {/* Created Date - Desktop */}
                {isDesktop && (
                    <div className="flex items-center gap-1 text-[7px] text-muted-foreground/30">
                        <Calendar className="h-2.5 w-2.5" />
                        <span>Created {createdAt}</span>
                    </div>
                )}

                {/* Open Indicator */}
                <div className="flex items-center text-[8px] text-primary font-black uppercase tracking-[0.25em] opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0 pt-1">
                    Open Project <ArrowRight className="h-3 w-3 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                </div>
            </div>

            {/* Atmospheric Background Decoration */}
            <div className="absolute -bottom-4 -right-4 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-700 pointer-events-none group-hover:scale-110">
                <BookOpen className="h-24 w-24" />
            </div>

            {/* Hover Border Effect - Desktop */}
            {isDesktop && isHovered && !isLoading && !isDeleting && (
                <div className="absolute inset-0 rounded-2xl ring-1 ring-primary/20 pointer-events-none animate-in fade-in duration-200" />
            )}
        </div>
    );
}

ProjectNodeItem.displayName = 'ProjectNodeItem';
