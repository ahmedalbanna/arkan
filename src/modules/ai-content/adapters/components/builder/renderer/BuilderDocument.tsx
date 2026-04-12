'use client';

import { MarkdownViewer } from '@/components/shared/MarkdownViewer';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { cn } from '@/infrastructure/utils/cn';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { Project } from '@/modules/projects/domain/entities/Project';
import {
    AlertCircle,
    AlignLeft,
    Check,
    ChevronDown,
    ChevronUp,
    Command,
    Copy,
    Maximize2,
    Minimize2,
    PenLine,
    RefreshCw,
    Sparkles,
    Wand2,
    ZoomIn
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MarkdownEditor from './MarkdownEditor';
import { type RewriteStyleOption, type SectionMutation } from './types';

/**
 * BuilderDocument — Core production rendering logic for the document canvas.
 * Orchestrates the transition between high-fidelity preview and raw markdown editing.
 */

interface DocumentProps {
    project: Project;
    viewMode: 'edit' | 'preview';
    onMarkdownChange: (newMarkdown: string) => void;
    activeChapterId: string | null;
    setActiveChapterId: (id: string | null) => void;
    selectedSectionIds: string[];
    handleActiveSectionChange: (id: string | null, multiSelect?: boolean) => void;
    summarizeMutation?: SectionMutation;
    expandMutation?: SectionMutation;
    rewriteMutation?: SectionMutation;
    rewriteStyles?: RewriteStyleOption[];
}

// ── Chapter Preview Node ───────────────────────────────────────────────────────

interface ChapterPreviewProps {
    item: Chapter;
    index: number;
    isPreview: boolean;
    activeChapterId: string | null;
    hoveredItemId: string | null;
    onHoverEnter: (id: string) => void;
    onHoverLeave: () => void;
    onSelectChapter: (chapterId: string) => void;
    onSelectChapterSections: (chapter: Chapter) => void;
    handleActiveSectionChange: (id: string | null, multiSelect?: boolean) => void;
}

const ChapterPreview = React.memo(({
    item,
    index,
    isPreview,
    activeChapterId,
    hoveredItemId,
    onHoverEnter,
    onHoverLeave,
    onSelectChapter,
    onSelectChapterSections,
    handleActiveSectionChange,
}: ChapterPreviewProps) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const sectionCount = item.sections?.length || 0;

    if (!item) return null;

    const chapterContent = (
        <div
            id={`item-${item.id}`}
            onMouseEnter={isPreview ? () => onHoverEnter(item.id) : undefined}
            onMouseLeave={isPreview ? onHoverLeave : undefined}
            onDoubleClick={!isPreview ? () => {
                try {
                    onSelectChapterSections(item);
                    if (Array.isArray(item.sections)) {
                        item.sections.forEach(section => handleActiveSectionChange(section.id, true));
                    }
                } catch (e) {
                    console.error('[BuilderDocument] Chapter selection failed:', e);
                }
            } : undefined}
            className={cn(
                'space-y-6 scroll-mt-24 rounded-xl transition-all duration-300 group/chapter',
                !isPreview && 'cursor-default',
                !isPreview && activeChapterId === item.id && 'rounded-xl ring-1 ring-primary/20 bg-primary/[0.02] p-5 -mx-5 shadow-sm',
                isPreview && 'p-5 -mx-5 cursor-default hover:bg-primary/[0.03] hover:ring-1 hover:ring-primary/10',
                isPreview && hoveredItemId === item.id && 'ring-1 ring-primary/20 bg-primary/[0.03]'
            )}
        >
            <div className="border-b border-primary/10 pb-4 relative">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isPreview && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-0.5 rounded-md hover:bg-primary/10 transition-colors"
                            >
                                {isExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-muted-foreground/40" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground/40" />
                                )}
                            </button>
                        )}
                        <h2 className="text-2xl font-black font-headline uppercase tracking-tight text-primary flex items-center gap-3">
                            <span className="text-xs opacity-40 tabular-nums">0{index + 1}</span>
                            {item.title || 'Untitled Chapter'}
                        </h2>
                    </div>
                    {isPreview && sectionCount > 0 && (
                        <div className="text-[8px] font-mono text-muted-foreground/30">
                            {sectionCount} section{sectionCount !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>
                {isPreview && (
                    <div className="absolute top-0 right-0 opacity-0 group-hover/chapter:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-primary/10 shadow-sm">
                            <Sparkles className="h-3 w-3" />
                            Neural Hub
                        </div>
                    </div>
                )}
            </div>
            {isExpanded && (
                <div className="space-y-8 pl-4 border-l-2 border-primary/5 ml-2">
                    {Array.isArray(item.sections) && item.sections.map((section, sIndex) => (
                        <div key={section.id} id={`item-${section.id}`} className="space-y-4 scroll-mt-24">
                            <h3 className="text-lg font-bold font-headline flex items-center gap-2">
                                <span className="text-[10px] opacity-40 tabular-nums">{index + 1}.{sIndex + 1}</span>
                                {section.title || 'Untitled Section'}
                            </h3>
                            <MarkdownViewer content={section.content || ''} noScroll />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    if (!isPreview) return <React.Fragment key={item.id}>{chapterContent}</React.Fragment>;

    return (
        <Popover key={item.id} open={hoveredItemId === item.id} onOpenChange={() => { }}>
            <PopoverTrigger asChild>{chapterContent}</PopoverTrigger>
            <PopoverContent
                side="top"
                align="end"
                className="w-auto p-2 bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-xl z-[110]"
                onMouseEnter={() => onHoverEnter(item.id)}
                onMouseLeave={onHoverLeave}
            >
                <div className="flex items-center gap-1">
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 px-2 py-1 border-r border-primary/10 mr-1">
                        Chapter
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-[10px] font-black uppercase tracking-[0.2em] gap-1.5 hover:bg-primary/10 hover:text-primary rounded-lg"
                                    onClick={() => onSelectChapter(item.id)}
                                >
                                    <PenLine className="h-3.5 w-3.5" /> Edit
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-[8px]">
                                Edit chapter
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-[10px] font-black uppercase tracking-[0.2em] gap-1.5 hover:bg-primary/10 hover:text-primary rounded-lg"
                                    onClick={() => onSelectChapter(item.id)}
                                >
                                    <Sparkles className="h-3.5 w-3.5" /> AI Tools
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-[8px]">
                                Open AI tools
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </PopoverContent>
        </Popover>
    );
});

ChapterPreview.displayName = 'ChapterPreview';

// ── Section Preview Node ───────────────────────────────────────────────────────

interface SectionPreviewProps {
    item: Section;
    index: number;
    chapterIndex?: number;
    isPreview: boolean;
    hoveredItemId: string | null;
    isActiveSectionInEdit: boolean;
    isSummarizing: boolean;
    isExpanding: boolean;
    isRewriting: boolean;
    rewriteStyles?: RewriteStyleOption[];
    onHoverEnter: (id: string) => void;
    onHoverLeave: () => void;
    onSelectSection: (sectionId: string) => void;
    onEditSection: (sectionId: string) => void;
    onSummarize: (section: Section) => void;
    onExpand: (section: Section) => void;
    onRewrite: (section: Section, style: string) => void;
    onCopyContent?: (content: string) => void;
}

const SectionPreview = React.memo(({
    item,
    index,
    chapterIndex,
    isPreview,
    hoveredItemId,
    isActiveSectionInEdit,
    isSummarizing,
    isExpanding,
    isRewriting,
    rewriteStyles,
    onHoverEnter,
    onHoverLeave,
    onSelectSection,
    onEditSection,
    onSummarize,
    onExpand,
    onRewrite,
    onCopyContent,
}: SectionPreviewProps) => {
    const [copied, setCopied] = useState(false);

    if (!item) return null;

    const handleCopy = () => {
        if (item.content && onCopyContent) {
            onCopyContent(item.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const sectionNumber = chapterIndex !== undefined
        ? `${chapterIndex}.${index + 1}`
        : `${index + 1}`;

    const sectionContent = (
        <div
            id={`item-${item.id}`}
            onMouseEnter={isPreview ? () => onHoverEnter(item.id) : undefined}
            onMouseLeave={isPreview ? onHoverLeave : undefined}
            onClick={!isPreview ? () => onSelectSection(item.id) : undefined}
            className={cn(
                'space-y-4 scroll-mt-24 rounded-xl transition-all duration-300 group/section',
                !isPreview && 'cursor-pointer',
                !isPreview && isActiveSectionInEdit && 'ring-1 ring-primary/30 bg-primary/[0.02] p-5 -mx-5 shadow-sm',
                isPreview && 'p-5 -mx-5 cursor-default hover:bg-primary/[0.03] hover:ring-1 hover:ring-primary/10',
                isPreview && hoveredItemId === item.id && 'ring-1 ring-primary/20 bg-primary/[0.03]'
            )}
        >
            <div className="relative">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold font-headline flex items-center gap-2">
                        <span className="text-[10px] opacity-40 tabular-nums font-mono">
                            {sectionNumber}
                        </span>
                        {item.title || 'Untitled Section'}
                    </h3>
                    {isPreview && item.content && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={handleCopy}
                                        className="opacity-0 group-hover/section:opacity-100 transition-opacity p-1 rounded-md hover:bg-primary/10"
                                    >
                                        {copied ? (
                                            <Check className="h-3.5 w-3.5 text-green-500" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5 text-muted-foreground/40" />
                                        )}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-[8px]">
                                    Copy section content
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                {isPreview && (
                    <div className="absolute top-0 right-0 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-primary/10 shadow-sm">
                            <Sparkles className="h-3.5 w-3.5" />
                            AI Actions
                        </div>
                    </div>
                )}
            </div>
            <MarkdownViewer content={item.content || ''} noScroll />
        </div>
    );

    if (!isPreview) return <React.Fragment key={item.id}>{sectionContent}</React.Fragment>;

    return (
        <Popover key={item.id} open={hoveredItemId === item.id} onOpenChange={() => { }}>
            <PopoverTrigger asChild>{sectionContent}</PopoverTrigger>
            <PopoverContent
                side="top"
                align="end"
                className="w-auto p-2 bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-xl z-[110]"
                onMouseEnter={() => onHoverEnter(item.id)}
                onMouseLeave={onHoverLeave}
            >
                <div className="flex items-center gap-1 flex-wrap">
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 px-2 py-1 border-r border-primary/10 mr-1">
                        Section
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-[10px] font-black uppercase tracking-[0.2em] gap-1.5 hover:bg-primary/10 hover:text-primary rounded-lg"
                                    onClick={() => onEditSection(item.id)}
                                >
                                    <PenLine className="h-3.5 w-3.5" /> Edit
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-[8px]">
                                Edit section
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={isSummarizing}
                                    className="h-8 px-3 text-[10px] font-black uppercase tracking-[0.2em] gap-1.5 hover:bg-primary/10 hover:text-primary rounded-lg"
                                    onClick={() => onSummarize(item)}
                                >
                                    {isSummarizing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <AlignLeft className="h-3.5 w-3.5" />}
                                    Summarize
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-[8px]">
                                Summarize content
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={isExpanding}
                                    className="h-8 px-3 text-[10px] font-black uppercase tracking-[0.2em] gap-1.5 hover:bg-primary/10 hover:text-primary rounded-lg"
                                    onClick={() => onExpand(item)}
                                >
                                    {isExpanding ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ZoomIn className="h-3.5 w-3.5" />}
                                    Expand
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-[8px]">
                                Expand content
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={isRewriting}
                                className="h-8 px-3 text-[10px] font-black uppercase tracking-[0.2em] gap-1.5 hover:bg-primary/10 hover:text-primary rounded-lg"
                            >
                                {isRewriting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                                Rewrite
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl min-w-[160px] z-[120]">
                            {Array.isArray(rewriteStyles) && rewriteStyles.map(({ label, style }) => (
                                <DropdownMenuItem
                                    key={style}
                                    className="text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer focus:bg-primary/5 focus:text-primary py-2"
                                    onSelect={() => onRewrite(item, style)}
                                >
                                    {label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </PopoverContent>
        </Popover>
    );
});

SectionPreview.displayName = 'SectionPreview';

// ── Main Document Orchestrator ─────────────────────────────────────────────────

export const BuilderDocument = ({
    project,
    viewMode,
    onMarkdownChange,
    activeChapterId,
    setActiveChapterId,
    selectedSectionIds,
    handleActiveSectionChange,
    summarizeMutation,
    expandMutation,
    rewriteMutation,
    rewriteStyles,
}: DocumentProps) => {
    const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
    const [isFullWidth, setIsFullWidth] = useState(false);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Keyboard shortcuts
    // useKeyboardShortcut('e', () => {
    //     if (viewMode === 'preview') {
    //         // Toggle edit mode - would need parent handler
    //         console.log('Switch to edit mode');
    //     }
    // }, { ctrl: true });

    // useKeyboardShortcut('p', () => {
    //     if (viewMode === 'edit') {
    //         // Toggle preview mode - would need parent handler
    //         console.log('Switch to preview mode');
    //     }
    // }, { ctrl: true });

    // Data derivation
    const allSections = useMemo(() => {
        try {
            if (!project || !Array.isArray(project.content)) return [];
            return project.content.flatMap(item =>
                item instanceof Chapter ? item.sections : item instanceof Section ? [item] : []
            );
        } catch (e) {
            console.error('[BuilderDocument] Section mapping failed:', e);
            return [];
        }
    }, [project]);

    // Content stats
    const contentStats = useMemo(() => {
        const chapters = project.content.filter(item => item instanceof Chapter).length;
        const sections = allSections.length;
        const totalWords = allSections.reduce((sum, s) => sum + (s.content?.split(/\s+/).length || 0), 0);
        return { chapters, sections, totalWords };
    }, [project.content, allSections]);

    // Hover handlers
    const handleItemMouseEnter = useCallback((id: string) => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setHoveredItemId(id);
    }, []);

    const handleItemMouseLeave = useCallback(() => {
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredItemId(null);
        }, 300);
    }, []);

    useEffect(() => () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
    }, []);

    // Selection recovery
    const handleActiveItemDetect = useCallback((headingText: string | null) => {
        if (!headingText || !headingText.trim()) return;

        try {
            const trimmed = headingText.trim();
            const matched = allSections.find(section => section.title?.trim() === trimmed);
            if (matched) {
                handleActiveSectionChange(matched.id);
                return;
            }

            const matchedChapter = project.content.find(
                item => item instanceof Chapter && item.title?.trim() === trimmed
            );
            if (matchedChapter instanceof Chapter) {
                setActiveChapterId(matchedChapter.id);
            }
        } catch (e) {
            console.error('[BuilderDocument] Active item detection failure:', e);
        }
    }, [allSections, handleActiveSectionChange, project.content, setActiveChapterId]);

    const handleSelectChapterSections = useCallback((chapter: Chapter) => {
        if (!chapter) return;
        setActiveChapterId(chapter.id);
        if (Array.isArray(chapter.sections)) {
            chapter.sections.forEach(section => handleActiveSectionChange(section.id, true));
        }
    }, [handleActiveSectionChange, setActiveChapterId]);

    const handleSelectChapter = useCallback((chapterId: string) => {
        setActiveChapterId(chapterId);
        setHoveredItemId(null);
    }, [setActiveChapterId]);

    const handleSectionClick = useCallback((sectionId: string) => {
        handleActiveSectionChange(sectionId);
    }, [handleActiveSectionChange]);

    const handleSectionEdit = useCallback((sectionId: string) => {
        handleActiveSectionChange(sectionId);
        setHoveredItemId(null);
    }, [handleActiveSectionChange]);

    const handleSummarize = useCallback((section: Section) => {
        if (!summarizeMutation?.mutate) return;
        summarizeMutation.mutate({ text: section.content || '', sectionId: section.id } as any);
    }, [summarizeMutation]);

    const handleExpand = useCallback((section: Section) => {
        if (!expandMutation?.mutate) return;
        expandMutation.mutate({ text: section.content || '', sectionId: section.id } as any);
    }, [expandMutation]);

    const handleRewrite = useCallback((section: Section, style: string) => {
        if (!rewriteMutation?.mutate) return;
        rewriteMutation.mutate({ text: section.content || '', style, sectionId: section.id } as any);
    }, [rewriteMutation]);

    const handleCopyContent = useCallback(async (content: string) => {
        await navigator.clipboard.writeText(content);
    }, []);

    if (!project) return null;

    return (
        <div className={cn(
            "pb-32 relative",
            isFullWidth && "max-w-none"
        )}>
            {/* Desktop Stats Bar */}
            {viewMode === 'preview' && (
                <div className="sticky top-0 z-30 mb-6 -mt-2 pt-2 bg-background/80 backdrop-blur-sm border-b border-primary/10">
                    <div className="flex items-center justify-between text-[8px] text-muted-foreground/40 py-1.5 px-2">
                        <div className="flex items-center gap-4">
                            <span>{contentStats.chapters} chapter{contentStats.chapters !== 1 ? 's' : ''}</span>
                            <span>•</span>
                            <span>{contentStats.sections} section{contentStats.sections !== 1 ? 's' : ''}</span>
                            <span>•</span>
                            <span>{contentStats.totalWords.toLocaleString()} words</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => setIsFullWidth(!isFullWidth)}
                                            className="p-1 rounded hover:bg-primary/10 transition-colors"
                                        >
                                            {isFullWidth ? (
                                                <Minimize2 className="h-3 w-3" />
                                            ) : (
                                                <Maximize2 className="h-3 w-3" />
                                            )}
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="text-[8px]">
                                        {isFullWidth ? 'Normal width' : 'Full width'}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <div className="flex items-center gap-1">
                                <Command className="h-2.5 w-2.5" />
                                <span>⌘E to edit • ⌘P to preview</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Dot-grid atmosphere */}
            <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px]" />

            {viewMode === 'edit' ? (
                <div className="animate-in fade-in duration-700">
                    <MarkdownEditor
                        content={project.fullMarkdownContent || ''}
                        onChange={onMarkdownChange}
                        onDebouncedChange={onMarkdownChange}
                        onActiveItemDetect={handleActiveItemDetect}
                        autoSave={true}
                    />
                </div>
            ) : (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
                    {Array.isArray(project.content) && project.content.length > 0 ? (
                        (() => {
                            let chapterIndex = 0;
                            let sectionIndex = 0;

                            return project.content.map((item) => {
                                if (item instanceof Chapter) {
                                    chapterIndex++;
                                    sectionIndex = 0;
                                    return (
                                        <ChapterPreview
                                            key={item.id}
                                            item={item}
                                            index={chapterIndex - 1}
                                            isPreview={true}
                                            activeChapterId={activeChapterId}
                                            hoveredItemId={hoveredItemId}
                                            onHoverEnter={handleItemMouseEnter}
                                            onHoverLeave={handleItemMouseLeave}
                                            onSelectChapter={handleSelectChapter}
                                            onSelectChapterSections={handleSelectChapterSections}
                                            handleActiveSectionChange={handleActiveSectionChange}
                                        />
                                    );
                                }

                                if (item instanceof Section) {
                                    sectionIndex++;
                                    const isSummarizing = Boolean(
                                        summarizeMutation?.isPending && summarizeMutation?.variables?.sectionId === item.id
                                    );
                                    const isExpanding = Boolean(
                                        expandMutation?.isPending && expandMutation?.variables?.sectionId === item.id
                                    );
                                    const isRewriting = Boolean(
                                        rewriteMutation?.isPending && rewriteMutation?.variables?.sectionId === item.id
                                    );
                                    const isActiveSectionInEdit = !isPreview && Array.isArray(selectedSectionIds) && selectedSectionIds.includes(item.id);

                                    return (
                                        <SectionPreview
                                            key={item.id}
                                            item={item}
                                            index={sectionIndex - 1}
                                            chapterIndex={chapterIndex}
                                            isPreview={true}
                                            hoveredItemId={hoveredItemId}
                                            isActiveSectionInEdit={isActiveSectionInEdit}
                                            isSummarizing={isSummarizing}
                                            isExpanding={isExpanding}
                                            isRewriting={isRewriting}
                                            rewriteStyles={rewriteStyles}
                                            onHoverEnter={handleItemMouseEnter}
                                            onHoverLeave={handleItemMouseLeave}
                                            onSelectSection={handleSectionClick}
                                            onEditSection={handleSectionEdit}
                                            onSummarize={handleSummarize}
                                            onExpand={handleExpand}
                                            onRewrite={handleRewrite}
                                            onCopyContent={handleCopyContent}
                                        />
                                    );
                                }

                                return null;
                            });
                        })()
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center space-y-5 opacity-40">
                            <div className="p-6 rounded-full bg-muted/20 border border-dashed border-muted-foreground/40">
                                <AlertCircle className="h-12 w-12 text-muted-foreground stroke-[1]" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[11px] font-black uppercase tracking-[0.25em]">No Content</p>
                                <p className="text-[10px] text-muted-foreground/60 italic max-w-md">
                                    Start by adding a chapter or section to your document structure.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

BuilderDocument.displayName = 'BuilderDocument';

