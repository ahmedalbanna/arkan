'use client';

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Project } from '@/modules/projects/domain/entities/Project';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import MarkdownEditor from './MarkdownEditor';
import { MarkdownViewer } from '@/components/shared/MarkdownViewer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PenLine, RefreshCw, Sparkles, MousePointer2, AlignLeft, ZoomIn, Wand2, AlertCircle } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';
import { type SectionMutation, type RewriteStyleOption } from './types';

/**
 * BuilderDocument — Core production rendering logic for the document canvas.
 * Orchestrates the transition between high-fidelity preview and raw markdown editing.
 * 
 * DEFENSIVE MEASURES:
 * 1. Type Guards: Explicit instanceof checks for Chapter and Section entities.
 * 2. Lifecycle Protection: Guarded hover and focus management with timeout cleanup.
 * 3. AI Execution Safety: Validates mutation availability before triggering neural tasks.
 * 4. Sync Integrity: Ensures matched entities exist before selection updates.
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
    // Existence Guard for item
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
                'space-y-8 scroll-mt-24 rounded-xl transition-all duration-300 group/chapter',
                !isPreview && 'cursor-default',
                !isPreview && activeChapterId === item.id && 'rounded-xl ring-1 ring-primary/20 bg-primary/[0.02] p-4 -mx-4 shadow-sm',
                isPreview && 'p-4 -mx-4 cursor-default hover:bg-primary/[0.03] hover:ring-1 hover:ring-primary/10',
                isPreview && hoveredItemId === item.id && 'ring-1 ring-primary/20 bg-primary/[0.03]'
            )}
        >
            <div className="border-b border-primary/10 pb-4 relative">
                <h2 className="text-2xl font-black font-headline uppercase tracking-tight text-primary flex items-center gap-3">
                    <span className="text-xs opacity-40 tabular-nums">0{index + 1}</span>
                    {item.title || 'Untitled Chapter'}
                </h2>
                {isPreview && (
                    <div className="absolute top-0 right-0 opacity-0 group-hover/chapter:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 bg-background/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-primary/10 shadow-sm">
                            <Sparkles className="h-3 w-3" />
                            Neural Hub
                        </div>
                    </div>
                )}
            </div>
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
        </div>
    );

    if (!isPreview) return <React.Fragment key={item.id}>{chapterContent}</React.Fragment>;

    return (
        <Popover key={item.id} open={hoveredItemId === item.id} onOpenChange={() => { }}>
            <PopoverTrigger asChild>{chapterContent}</PopoverTrigger>
            <PopoverContent
                side="top"
                align="end"
                className="w-auto p-2 bg-background/95 backdrop-blur-2xl border border-primary/20 shadow-2xl rounded-2xl z-[110]"
                onMouseEnter={() => onHoverEnter(item.id)}
                onMouseLeave={onHoverLeave}
            >
                <div className="flex items-center gap-1">
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 px-2 py-1 border-r border-primary/10 mr-1">
                        Chapter
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-[10px] font-black uppercase tracking-[0.2em] gap-1.5 hover:bg-primary/10 hover:text-primary rounded-xl"
                        onClick={() => onSelectChapter(item.id)}
                    >
                        <PenLine className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-[10px] font-black uppercase tracking-[0.2em] gap-1.5 hover:bg-primary/10 hover:text-primary rounded-xl"
                        onClick={() => onSelectChapter(item.id)}
                    >
                        <Sparkles className="h-3.5 w-3.5" /> AI Tools
                    </Button>
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
}

const SectionPreview = React.memo(({
    item,
    index,
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
}: SectionPreviewProps) => {
    // Existence Guard for item
    if (!item) return null;

    const sectionContent = (
        <div
            id={`item-${item.id}`}
            onMouseEnter={isPreview ? () => onHoverEnter(item.id) : undefined}
            onMouseLeave={isPreview ? onHoverLeave : undefined}
            onClick={!isPreview ? () => onSelectSection(item.id) : undefined}
            className={cn(
                'space-y-4 scroll-mt-24 rounded-xl transition-all duration-300 group/section',
                !isPreview && 'cursor-pointer',
                !isPreview && isActiveSectionInEdit && 'ring-1 ring-primary/30 bg-primary/[0.02] p-4 -mx-4 shadow-sm',
                isPreview && 'p-4 -mx-4 cursor-default hover:bg-primary/[0.03] hover:ring-1 hover:ring-primary/10',
                isPreview && hoveredItemId === item.id && 'ring-1 ring-primary/20 bg-primary/[0.03]'
            )}
        >
            <div className="relative">
                <h3 className="text-lg font-bold font-headline flex items-center gap-2">
                    <span className="text-[10px] opacity-40 tabular-nums">{index + 1}</span>
                    {item.title || 'Untitled Section'}
                </h3>
                {isPreview && (
                    <div className="absolute top-0 right-0 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 bg-background/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-primary/10 shadow-sm">
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
                className="w-auto p-2 bg-background/95 backdrop-blur-2xl border border-primary/20 shadow-2xl rounded-2xl z-[110]"
                onMouseEnter={() => onHoverEnter(item.id)}
                onMouseLeave={onHoverLeave}
            >
                <div className="flex items-center gap-1">
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 px-2 py-1 border-r border-primary/10 mr-1">
                        Section
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-[10px] font-black uppercase tracking-[0.2em] gap-1.5 hover:bg-primary/10 hover:text-primary rounded-xl"
                        onClick={() => onEditSection(item.id)}
                    >
                        <PenLine className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={isSummarizing}
                        className="h-8 px-3 text-[10px] font-black uppercase tracking-[0.2em] gap-1.5 hover:bg-primary/10 hover:text-primary rounded-xl"
                        onClick={() => onSummarize(item)}
                    >
                        {isSummarizing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <AlignLeft className="h-3.5 w-3.5" />}
                        Summarize
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={isExpanding}
                        className="h-8 px-3 text-[10px] font-black uppercase tracking-[0.2em] gap-1.5 hover:bg-primary/10 hover:text-primary rounded-xl"
                        onClick={() => onExpand(item)}
                    >
                        {isExpanding ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ZoomIn className="h-3.5 w-3.5" />}
                        Expand
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={isRewriting}
                                className="h-8 px-3 text-[10px] font-black uppercase tracking-[0.2em] gap-1.5 hover:bg-primary/10 hover:text-primary rounded-xl"
                            >
                                {isRewriting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                                Rewrite
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl z-[120]">
                            {Array.isArray(rewriteStyles) && rewriteStyles.map(({ label, style }) => (
                                <DropdownMenuItem
                                    key={style}
                                    className="text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer focus:bg-primary/5 focus:text-primary"
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
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 1. DATA DERIVATION — Guarded flat map
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

    // 2. LIFECYCLE HANDLERS — Cleaned hover states
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

    // 3. SELECTION RECOVERY — Resilient node detection
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

    // 4. RENDER GUARDS
    if (!project) return null;

    return (
        <div className="pb-32 relative">
            {/* Dot-grid atmosphere — Standardized Workspace Alignment (28px) */}
            <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px]" />

            {viewMode === 'edit' ? (
                <div className="animate-in fade-in duration-700">
                    <MarkdownEditor
                        content={project.fullMarkdownContent || ''}
                        onChange={onMarkdownChange}
                        onDebouncedChange={onMarkdownChange}
                        onActiveItemDetect={handleActiveItemDetect}
                    />
                </div>
            ) : (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
                    {Array.isArray(project.content) && project.content.length > 0 ? (
                        project.content.map((item, index) => {
                            const isPreview = viewMode === 'preview';

                            if (item instanceof Chapter) {
                                return (
                                    <ChapterPreview
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        isPreview={isPreview}
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
                                        index={index}
                                        isPreview={isPreview}
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
                                    />
                                );
                            }

                            return null;
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
                            <AlertCircle className="h-10 w-10 text-muted-foreground" />
                            <p className="text-[10px] font-black uppercase tracking-[0.25em]">No renderable nodes</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
