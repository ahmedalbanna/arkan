'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Eye,
    PenLine,
    Maximize2,
    Minimize2,
    Lightbulb,
    Clock,
    Bold,
    Italic,
    Strikethrough,
    List,
    ListOrdered,
    Quote,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Undo2,
    Redo2,
} from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';
import { useEditorStore } from '@/modules/ai-content/adapters/state/use-editor-store';
import { Project } from '@/modules/projects/domain/entities/Project';

interface DocumentToolbarBaseProps {
    project: Project | null;
    viewMode: 'edit' | 'preview';
    setViewMode: (mode: 'edit' | 'preview') => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    suggestion: string;
    className?: string;
}

export const DocumentToolbarBase = ({
    project,
    viewMode,
    setViewMode,
    isFullscreen,
    onToggleFullscreen,
    suggestion,
    className,
}: DocumentToolbarBaseProps) => {
    const activeEditor = useEditorStore((state) => state.activeEditor);
    const selection = useEditorStore((state) => state.selection);

    const handleEditorAction = (action: () => void) => {
        if (!activeEditor) return;
        action();
        activeEditor.commands.focus();
    };

    const handleToggleHeading = (level: 1 | 2 | 3) => {
        if (!activeEditor) return;
        activeEditor.chain().focus().toggleHeading({ level }).run();
    };

    const canEdit = viewMode === 'edit' && !!activeEditor;

    return (
        <div
            className={cn(
                'flex flex-col gap-2 px-4 py-2 border-b border-border/40 bg-background/60 backdrop-blur-2xl',
                className
            )}
        >
            <div className="flex items-center justify-between">
                {/* Left — status indicators */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-black uppercase tracking-[0.22em] bg-background/70 px-2.5 py-1 rounded-full border border-border/30 shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        Live
                    </div>

                    <div className="w-px h-4 bg-border/40" aria-hidden />

                    {project?.meta.updated ? (
                        <span className="flex items-center gap-1 text-[9px] text-muted-foreground/50 font-bold uppercase tracking-[0.15em]">
                            <Clock className="h-2.5 w-2.5 opacity-50" />
                            {formatDistanceToNow(new Date(project.meta.updated), { addSuffix: true })}
                        </span>
                    ) : (
                        <span className="text-[9px] text-muted-foreground/30 font-bold uppercase tracking-[0.15em]">
                            Not saved yet
                        </span>
                    )}
                </div>

                {/* Right — action buttons */}
                <div className="flex items-center gap-0.5">
                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={viewMode === 'edit' ? 'Switch to Preview' : 'Switch to Edit'}
                                    className={cn(
                                        'h-7 w-7 rounded-lg transition-all duration-200',
                                        viewMode === 'edit'
                                            ? 'bg-primary/10 text-primary shadow-sm'
                                            : 'hover:bg-primary/5 hover:text-primary text-muted-foreground'
                                    )}
                                    onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
                                >
                                    {viewMode === 'edit' ? (
                                        <Eye className="h-3.5 w-3.5" />
                                    ) : (
                                        <PenLine className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent
                                side="bottom"
                                className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mt-2"
                            >
                                {viewMode === 'edit' ? 'Preview Mode' : 'Edit Mode'}
                                <span className="opacity-50 ml-1.5 font-normal normal-case tracking-normal">
                                    {viewMode === 'edit' ? 'Ctrl P' : 'Ctrl E'}
                                </span>
                            </TooltipContent>
                        </Tooltip>

                        <div className="w-px h-4 bg-border/40 mx-1.5" aria-hidden />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                                    className="h-7 w-7 rounded-lg hover:bg-primary/5 hover:text-primary text-muted-foreground transition-all duration-200"
                                    onClick={onToggleFullscreen}
                                >
                                    {isFullscreen ? (
                                        <Minimize2 className="h-3.5 w-3.5" />
                                    ) : (
                                        <Maximize2 className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent
                                side="bottom"
                                className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mt-2"
                            >
                                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                                <span className="opacity-50 ml-1.5 font-normal normal-case tracking-normal">F11</span>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label="Writer's guide and intelligent suggestions"
                                    className="h-7 text-[9px] font-black uppercase tracking-[0.18em] gap-1.5 px-2.5 rounded-lg hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 text-muted-foreground transition-all duration-200"
                                >
                                    <Lightbulb className="h-3 w-3 text-amber-500" />
                                    Guide
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent
                                side="bottom"
                                className="max-w-[260px] p-4 space-y-2 bg-background/95 backdrop-blur-md border-primary/20 mt-2"
                            >
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                                    Intelligent Suggestion
                                </p>
                                <p className="text-[11px] leading-relaxed text-muted-foreground italic">
                                    {suggestion}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {viewMode === 'edit' && (
                <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border/40 bg-background/70 px-2 py-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1.5">
                        Editor
                    </span>
                    <div className="w-px h-4 bg-border/40" aria-hidden />
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Bold"
                        disabled={!canEdit}
                        className={cn('h-7 w-7 rounded-lg', selection.isBold && 'bg-primary/10 text-primary')}
                        onClick={() => handleEditorAction(() => activeEditor?.chain().focus().toggleBold().run())}
                    >
                        <Bold className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Italic"
                        disabled={!canEdit}
                        className={cn('h-7 w-7 rounded-lg', selection.isItalic && 'bg-primary/10 text-primary')}
                        onClick={() => handleEditorAction(() => activeEditor?.chain().focus().toggleItalic().run())}
                    >
                        <Italic className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Strike"
                        disabled={!canEdit}
                        className={cn('h-7 w-7 rounded-lg', selection.isStrike && 'bg-primary/10 text-primary')}
                        onClick={() => handleEditorAction(() => activeEditor?.chain().focus().toggleStrike().run())}
                    >
                        <Strikethrough className="h-3.5 w-3.5" />
                    </Button>
                    <div className="w-px h-4 bg-border/40 mx-1" aria-hidden />
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Heading 1"
                        disabled={!canEdit}
                        className={cn('h-7 w-7 rounded-lg', selection.activeHeading === 1 && 'bg-primary/10 text-primary')}
                        onClick={() => handleToggleHeading(1)}
                    >
                        <Heading1 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Heading 2"
                        disabled={!canEdit}
                        className={cn('h-7 w-7 rounded-lg', selection.activeHeading === 2 && 'bg-primary/10 text-primary')}
                        onClick={() => handleToggleHeading(2)}
                    >
                        <Heading2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Heading 3"
                        disabled={!canEdit}
                        className={cn('h-7 w-7 rounded-lg', selection.activeHeading === 3 && 'bg-primary/10 text-primary')}
                        onClick={() => handleToggleHeading(3)}
                    >
                        <Heading3 className="h-3.5 w-3.5" />
                    </Button>
                    <div className="w-px h-4 bg-border/40 mx-1" aria-hidden />
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Bullet list"
                        disabled={!canEdit}
                        className={cn('h-7 w-7 rounded-lg', selection.isBulletList && 'bg-primary/10 text-primary')}
                        onClick={() => handleEditorAction(() => activeEditor?.chain().focus().toggleBulletList().run())}
                    >
                        <List className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Numbered list"
                        disabled={!canEdit}
                        className={cn('h-7 w-7 rounded-lg', selection.isOrderedList && 'bg-primary/10 text-primary')}
                        onClick={() => handleEditorAction(() => activeEditor?.chain().focus().toggleOrderedList().run())}
                    >
                        <ListOrdered className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Blockquote"
                        disabled={!canEdit}
                        className={cn('h-7 w-7 rounded-lg', selection.isBlockquote && 'bg-primary/10 text-primary')}
                        onClick={() => handleEditorAction(() => activeEditor?.chain().focus().toggleBlockquote().run())}
                    >
                        <Quote className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Code block"
                        disabled={!canEdit}
                        className={cn('h-7 w-7 rounded-lg', selection.isCodeBlock && 'bg-primary/10 text-primary')}
                        onClick={() => handleEditorAction(() => activeEditor?.chain().focus().toggleCodeBlock().run())}
                    >
                        <Code className="h-3.5 w-3.5" />
                    </Button>
                    <div className="w-px h-4 bg-border/40 mx-1" aria-hidden />
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Undo"
                        disabled={!canEdit}
                        className="h-7 w-7 rounded-lg"
                        onClick={() => handleEditorAction(() => activeEditor?.chain().focus().undo().run())}
                    >
                        <Undo2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Redo"
                        disabled={!canEdit}
                        className="h-7 w-7 rounded-lg"
                        onClick={() => handleEditorAction(() => activeEditor?.chain().focus().redo().run())}
                    >
                        <Redo2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )}
        </div>
    );
};
