'use client';

import React, { useState, useRef } from 'react';
import { Project } from '@/modules/projects/domain/entities/Project';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import MarkdownEditor from './MarkdownEditor';
import { MarkdownViewer } from '@/components/shared/MarkdownViewer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PenLine, RefreshCw, Sparkles, MousePointer2, AlignLeft, ZoomIn, Wand2 } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';
import { type SectionMutation, type RewriteStyleOption } from './types';

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

    const handleItemMouseEnter = (id: string) => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setHoveredItemId(id);
    };

    const handleItemMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredItemId(null);
        }, 300);
    };
    return (
        <div className="pb-32">
            {/* Editor / preview switch retains selection context */}
            {viewMode === 'edit' ? (
                <MarkdownEditor
                    content={project.fullMarkdownContent}
                    onChange={onMarkdownChange}
                    onDebouncedChange={onMarkdownChange}
                    onActiveItemDetect={(headingText) => {
                        if (!headingText || !project) return;
                        const allSections = project.content.flatMap(item =>
                            item instanceof Chapter ? item.sections : item instanceof Section ? [item] : []
                        );
                        const matched = allSections.find(s => s.title.trim() === headingText.trim());
                        if (matched) {
                            handleActiveSectionChange(matched.id);
                        } else {
                            const matchedChapter = project.content.find(
                                item => item instanceof Chapter && item.title.trim() === headingText.trim()
                            );
                            if (matchedChapter) setActiveChapterId(matchedChapter.id);
                        }
                    }}
                />
            ) : (
                <div className="space-y-12">
                    {project.content.map((item, index) => {
                        const isPreview = viewMode === 'preview';

                        if (item instanceof Chapter) {
                            const chapterContent = (
                                <div
                                    id={`item-${item.id}`}
                                    onMouseEnter={isPreview ? () => handleItemMouseEnter(item.id) : undefined}
                                    onMouseLeave={isPreview ? handleItemMouseLeave : undefined}
                                    onDoubleClick={!isPreview ? () => {
                                        setActiveChapterId(item.id);
                                        item.sections.forEach(s => handleActiveSectionChange(s.id, true));
                                    } : undefined}
                                    className={cn(
                                        "space-y-8 scroll-mt-24 rounded-xl transition-all duration-200 group/chapter",
                                        !isPreview && "cursor-default",
                                        !isPreview && activeChapterId === item.id && "rounded-xl ring-1 ring-primary/20 bg-primary/[0.02] p-4 -mx-4",
                                        isPreview && "p-4 -mx-4 cursor-default hover:bg-primary/[0.03] hover:ring-1 hover:ring-primary/10",
                                        isPreview && hoveredItemId === item.id && "ring-1 ring-primary/20 bg-primary/[0.03]"
                                    )}
                                >
                                    <div className="border-b border-primary/10 pb-4 relative">
                                        <h2 className="text-2xl font-black font-headline uppercase tracking-tight text-primary flex items-center gap-3">
                                            <span className="text-xs opacity-40 tabular-nums">0{index + 1}</span>
                                            {item.title}
                                        </h2>
                                        {isPreview && (
                                            <div className="absolute top-0 right-0 opacity-0 group-hover/chapter:opacity-100 transition-opacity duration-200">
                                                <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
                                                    <MousePointer2 className="h-3 w-3" />
                                                    AI Actions
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-8 pl-4 border-l-2 border-primary/5 ml-2">
                                        {item.sections.map((section, sIndex) => (
                                            <div key={section.id} id={`item-${section.id}`} className="space-y-4 scroll-mt-24">
                                                <h3 className="text-lg font-bold font-headline flex items-center gap-2">
                                                    <span className="text-[10px] opacity-40 tabular-nums">{index + 1}.{sIndex + 1}</span>
                                                    {section.title}
                                                </h3>
                                                <MarkdownViewer content={section.content} noScroll />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                            if (!isPreview) return <React.Fragment key={item.id}>{chapterContent}</React.Fragment>;
                            return (
                                <Popover
                                    key={item.id}
                                    open={hoveredItemId === item.id}
                                    onOpenChange={() => { }}
                                >
                                    <PopoverTrigger asChild>{chapterContent}</PopoverTrigger>
                                    <PopoverContent
                                        side="top" align="end"
                                        className="w-auto p-2 bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-2xl z-[110]"
                                        onMouseEnter={() => handleItemMouseEnter(item.id)}
                                        onMouseLeave={handleItemMouseLeave}
                                    >
                                        <div className="flex items-center gap-1">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-primary/60 px-2 py-1 border-r border-primary/10 mr-1">Chapter</div>
                                            <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-black uppercase tracking-widest gap-1.5 hover:bg-primary/10 hover:text-primary rounded-xl" onClick={() => { setActiveChapterId(item.id); setHoveredItemId(null); }}>
                                                <PenLine className="h-3.5 w-3.5" /> Edit
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-black uppercase tracking-widest gap-1.5 hover:bg-primary/10 hover:text-primary rounded-xl" onClick={() => { setActiveChapterId(item.id); setHoveredItemId(null); }}>
                                                <Sparkles className="h-3.5 w-3.5" /> AI Tools
                                            </Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            );
                        }

                        if (item instanceof Section) {
                            const isSummarizing = summarizeMutation?.isPending && summarizeMutation?.variables?.sectionId === item.id;
                            const isExpanding = expandMutation?.isPending && expandMutation?.variables?.sectionId === item.id;
                            const isRewriting = rewriteMutation?.isPending && rewriteMutation?.variables?.sectionId === item.id;
                            const isActiveSectionInEdit = !isPreview && selectedSectionIds.includes(item.id);

                            const sectionContent = (
                                <div
                                    id={`item-${item.id}`}
                                    onMouseEnter={isPreview ? () => handleItemMouseEnter(item.id) : undefined}
                                    onMouseLeave={isPreview ? handleItemMouseLeave : undefined}
                                    onClick={!isPreview ? () => handleActiveSectionChange(item.id) : undefined}
                                    className={cn(
                                        "space-y-4 scroll-mt-24 rounded-xl transition-all duration-200 group/section",
                                        !isPreview && "cursor-pointer",
                                        !isPreview && isActiveSectionInEdit && "ring-1 ring-primary/30 bg-primary/[0.02] p-4 -mx-4",
                                        isPreview && "p-4 -mx-4 cursor-default hover:bg-primary/[0.03] hover:ring-1 hover:ring-primary/10",
                                        isPreview && hoveredItemId === item.id && "ring-1 ring-primary/20 bg-primary/[0.03]"
                                    )}
                                >
                                    <div className="relative">
                                        <h3 className="text-lg font-bold font-headline flex items-center gap-2">
                                            <span className="text-[10px] opacity-40 tabular-nums">{index + 1}</span>
                                            {item.title}
                                        </h3>
                                        {isPreview && (
                                            <div className="absolute top-0 right-0 opacity-0 group-hover/section:opacity-100 transition-opacity duration-200">
                                                <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
                                                    <MousePointer2 className="h-3 w-3" />
                                                    AI Actions
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <MarkdownViewer content={item.content} noScroll />
                                </div>
                            );
                            if (!isPreview) return <React.Fragment key={item.id}>{sectionContent}</React.Fragment>;
                            return (
                                <Popover
                                    key={item.id}
                                    open={hoveredItemId === item.id}
                                    onOpenChange={() => { }}
                                >
                                    <PopoverTrigger asChild>{sectionContent}</PopoverTrigger>
                                    <PopoverContent
                                        side="top" align="end"
                                        className="w-auto p-2 bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-2xl z-[110]"
                                        onMouseEnter={() => handleItemMouseEnter(item.id)}
                                        onMouseLeave={handleItemMouseLeave}
                                    >
                                        <div className="flex items-center gap-1">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-primary/60 px-2 py-1 border-r border-primary/10 mr-1">Section</div>
                                            <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-black uppercase tracking-widest gap-1.5 hover:bg-primary/10 hover:text-primary rounded-xl" onClick={() => { handleActiveSectionChange(item.id); setHoveredItemId(null); }}>
                                                <PenLine className="h-3.5 w-3.5" /> Edit
                                            </Button>
                                            <Button
                                                variant="ghost" size="sm"
                                                disabled={isSummarizing}
                                                className="h-8 px-3 text-[10px] font-black uppercase tracking-widest gap-1.5 hover:bg-primary/10 hover:text-primary rounded-xl"
                                                onClick={() => summarizeMutation?.mutate({ text: item.content, sectionId: item.id } as any)}
                                            >
                                                {isSummarizing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <AlignLeft className="h-3.5 w-3.5" />}
                                                Summarize
                                            </Button>
                                            <Button
                                                variant="ghost" size="sm"
                                                disabled={isExpanding}
                                                className="h-8 px-3 text-[10px] font-black uppercase tracking-widest gap-1.5 hover:bg-primary/10 hover:text-primary rounded-xl"
                                                onClick={() => expandMutation?.mutate({ text: item.content, sectionId: item.id } as any)}
                                            >
                                                {isExpanding ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ZoomIn className="h-3.5 w-3.5" />}
                                                Expand
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost" size="sm"
                                                        disabled={isRewriting}
                                                        className="h-8 px-3 text-[10px] font-black uppercase tracking-widest gap-1.5 hover:bg-primary/10 hover:text-primary rounded-xl"
                                                    >
                                                        {isRewriting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                                                        Rewrite
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl z-[120]">
                                                    {rewriteStyles?.map(({ label, style }) => (
                                                        <DropdownMenuItem
                                                            key={style}
                                                            className="text-[10px] font-black uppercase tracking-widest cursor-pointer"
                                                            onSelect={() => rewriteMutation?.mutate({ text: item.content, style, sectionId: item.id } as any)}
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
                        }

                        return null;
                    })}
                </div>
            )}
        </div>
    );
};
