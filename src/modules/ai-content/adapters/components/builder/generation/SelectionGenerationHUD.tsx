'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMobile } from '@/hooks/util/use-mobile';
import { cn } from '@/infrastructure/utils/cn';
import { useAiActions } from '@/modules/ai-content/adapters/hooks/report-mode/use-ai-actions';
import { useEditorStore } from '@/modules/ai-content/adapters/state/use-editor-store';
import {
    Check,
    ChevronDown,
    Copy,
    Expand,
    GripVertical,
    Languages,
    Minimize2,
    RefreshCcw,
    Sparkles,
    Wand2,
    Zap
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface SelectionGenerationHUDProps {
    viewMode: 'edit' | 'preview';
    className?: string;
}

const SelectionGenerationHUDComponent = ({ viewMode, className }: SelectionGenerationHUDProps) => {
    const isMobile = useMobile();
    const isDesktop = !isMobile;
    const selection = useEditorStore((state) => state.selection);
    const { isProcessing, handleAiAction, rewriteStyles = [], cancelGeneration } = useAiActions();

    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isCopied, setIsCopied] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const elementRef = useRef<HTMLDivElement>(null);
    const dragHandleRef = useRef<HTMLDivElement>(null);

    // Load saved position from localStorage
    useEffect(() => {
        if (!isDesktop) return;
        const savedPosition = localStorage.getItem('selection-hud-position');
        if (savedPosition) {
            try {
                const pos = JSON.parse(savedPosition);
                setPosition(pos);
            } catch (e) {
                console.error('Failed to load HUD position', e);
            }
        }
    }, [isDesktop]);

    // Save position when dragging ends
    useEffect(() => {
        if (!isDesktop || !isDragging) return;
        const handleMouseMove = (e: MouseEvent) => {
            if (!elementRef.current) return;
            const newX = position.x + (e.clientX - dragStartRef.current.x);
            const newY = position.y + (e.clientY - dragStartRef.current.y);

            // Boundary constraints
            const maxX = window.innerWidth - (elementRef.current.offsetWidth || 280);
            const maxY = window.innerHeight - (elementRef.current.offsetHeight || 200);

            setPosition({
                x: Math.min(Math.max(0, newX), maxX),
                y: Math.min(Math.max(0, newY), maxY)
            });
            dragStartRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            localStorage.setItem('selection-hud-position', JSON.stringify(position));
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, position, isDesktop]);

    const handleDragStart = useCallback((e: React.MouseEvent) => {
        if (!isDesktop) return;
        e.preventDefault();
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
    }, [isDesktop]);

    const handleSummarize = useCallback(() => {
        if (!selection.hasSelection || !handleAiAction) return;
        handleAiAction('summarize');
    }, [handleAiAction, selection.hasSelection]);

    const handleExpand = useCallback(() => {
        if (!selection.hasSelection || !handleAiAction) return;
        handleAiAction('expand');
    }, [handleAiAction, selection.hasSelection]);

    const handleGrammar = useCallback(() => {
        if (!selection.hasSelection || !handleAiAction) return;
        handleAiAction('grammar');
    }, [handleAiAction, selection.hasSelection]);

    const handleHumanize = useCallback(() => {
        if (!selection.hasSelection || !handleAiAction) return;
        handleAiAction('humanize');
    }, [handleAiAction, selection.hasSelection]);

    const handleSimplify = useCallback(() => {
        if (!selection.hasSelection || !handleAiAction) return;
        handleAiAction('simplify');
    }, [handleAiAction, selection.hasSelection]);

    const handleImprove = useCallback(() => {
        if (!selection.hasSelection || !handleAiAction) return;
        handleAiAction('improve');
    }, [handleAiAction, selection.hasSelection]);

    const handleRewrite = useCallback((style: string) => {
        if (!selection.hasSelection || !handleAiAction) return;
        handleAiAction('rewrite', { style });
    }, [handleAiAction, selection.hasSelection]);

    const handleCancel = useCallback(() => {
        if (isProcessing && cancelGeneration) {
            cancelGeneration('current');
        }
    }, [isProcessing, cancelGeneration]);

    const handleCopySelection = useCallback(async () => {
        if (!selection.selectionText) return;
        await navigator.clipboard.writeText(selection.selectionText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }, [selection.selectionText]);

    // Desktop keyboard shortcuts
    useEffect(() => {
        if (!isDesktop || !selection.hasSelection || isProcessing) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Alt/Option + S for summarize
            if (e.altKey && e.key === 's') {
                e.preventDefault();
                handleSummarize();
            }
            // Alt/Option + E for expand
            if (e.altKey && e.key === 'e') {
                e.preventDefault();
                handleExpand();
            }
            // Alt/Option + G for grammar
            if (e.altKey && e.key === 'g') {
                e.preventDefault();
                handleGrammar();
            }
            // Alt/Option + H for humanize
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                handleHumanize();
            }
            // Alt/Option + R for rewrite dropdown (focus)
            if (e.altKey && e.key === 'r') {
                e.preventDefault();
                document.getElementById('rewrite-dropdown-trigger')?.click();
            }
            // Escape to cancel generation
            if (e.key === 'Escape' && isProcessing) {
                e.preventDefault();
                handleCancel();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDesktop, selection.hasSelection, isProcessing, handleSummarize, handleExpand, handleGrammar, handleHumanize, handleCancel]);

    // Render guards
    if (viewMode !== 'edit' || !selection.hasSelection) return null;

    // Get selection preview (first 150 chars)
    const selectionPreview = selection.selectionText.length > 150
        ? selection.selectionText.substring(0, 150) + '...'
        : selection.selectionText;

    return (
        <div
            ref={elementRef}
            style={{
                position: isDesktop ? 'fixed' : 'absolute',
                right: isDesktop ? 'auto' : '1.5rem',
                top: isDesktop ? position.y : '1.5rem',
                left: isDesktop ? position.x : 'auto',
            }}
            className={cn(
                'z-50 rounded-2xl border border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-300',
                isDesktop && 'cursor-default shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]',
                isDragging && 'cursor-grabbing opacity-95 transition-none',
                className
            )}
        >
            {/* Drag Handle - Desktop only */}
            {isDesktop && (
                <div
                    ref={dragHandleRef}
                    onMouseDown={handleDragStart}
                    className="absolute top-0 left-0 right-0 h-8 cursor-grab active:cursor-grabbing rounded-t-2xl hover:bg-primary/5 transition-colors flex items-center justify-center"
                >
                    <GripVertical className="h-3 w-3 text-muted-foreground/30" />
                </div>
            )}

            {/* Header */}
            <div className={cn(
                "flex items-center justify-between px-4 pt-3 pb-2 border-b border-border/40 bg-primary/[0.02]",
                isDesktop && "rounded-t-2xl"
            )}>
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isProcessing ? "bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.4)]" : "bg-primary/60 shadow-[0_0_8px_rgba(var(--primary),0.2)]"
                    )} />
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-primary/70">
                        {isProcessing ? 'AI Processing' : 'Selection Context'}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    {isDesktop && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 rounded-md hover:bg-primary/5"
                                        onClick={() => setIsMinimized(!isMinimized)}
                                    >
                                        <Minimize2 className="h-2.5 w-2.5 text-muted-foreground/40" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-[9px]">
                                    {isMinimized ? 'Expand' : 'Minimize'}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    <Sparkles className={cn("h-3.5 w-3.5 transition-colors", isProcessing ? "text-amber-500" : "text-primary/60")} />
                </div>
            </div>

            {!isMinimized && (
                <div className="px-4 py-3 space-y-3">
                    {/* Selection Digest */}
                    <div className="relative group/digest">
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3 italic font-medium px-1 flex-1">
                                "{selectionPreview || 'No text captured'}"
                            </p>
                            {selection.selectionText && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 rounded-md shrink-0 opacity-0 group-hover/digest:opacity-100 transition-opacity"
                                                onClick={handleCopySelection}
                                            >
                                                {isCopied ? (
                                                    <Check className="h-3 w-3 text-green-500" />
                                                ) : (
                                                    <Copy className="h-3 w-3 text-muted-foreground/40" />
                                                )}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-[9px]">
                                            Copy selection
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                        <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-primary/10 rounded-full" />
                    </div>

                    {/* Selection Stats - Desktop only */}
                    {isDesktop && (
                        <div className="flex items-center gap-3 px-1 text-[8px] font-mono text-muted-foreground/30">
                            <span>{selection.selectionLength} characters</span>
                            <span>•</span>
                            <span>{selection.selectionText.split(/\s+/).filter(w => w.length > 0).length} words</span>
                        </div>
                    )}

                    {/* Processing Indicator */}
                    {isProcessing && (
                        <div className="space-y-2">
                            <Progress value={undefined} className="h-0.5 bg-primary/10" />
                            <div className="flex items-center justify-between">
                                <span className="text-[8px] font-mono text-amber-500/60 animate-pulse">
                                    Generating...
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 text-[8px] font-black uppercase tracking-wider text-destructive hover:text-destructive"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Primary Manipulation Grid */}
                    <div className="grid grid-cols-2 gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border border-primary/10 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-50"
                                        disabled={isProcessing}
                                        onClick={handleSummarize}
                                    >
                                        <Wand2 className="h-3 w-3 mr-1.5" />
                                        Summarize
                                    </Button>
                                </TooltipTrigger>
                                {isDesktop && (
                                    <TooltipContent side="top" className="text-[9px]">
                                        Alt + S
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border border-primary/10 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-50"
                                        disabled={isProcessing}
                                        onClick={handleExpand}
                                    >
                                        <Expand className="h-3 w-3 mr-1.5" />
                                        Expand
                                    </Button>
                                </TooltipTrigger>
                                {isDesktop && (
                                    <TooltipContent side="top" className="text-[9px]">
                                        Alt + E
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Secondary Actions - Desktop only */}
                    {isDesktop && (
                        <div className="grid grid-cols-3 gap-1.5">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[8px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-primary/5"
                                disabled={isProcessing}
                                onClick={handleGrammar}
                            >
                                Grammar
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[8px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-primary/5"
                                disabled={isProcessing}
                                onClick={handleHumanize}
                            >
                                Humanize
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[8px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-primary/5"
                                disabled={isProcessing}
                                onClick={handleSimplify}
                            >
                                Simplify
                            </Button>
                        </div>
                    )}

                    {/* Advanced Style Controller */}
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    id="rewrite-dropdown-trigger"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 flex-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border border-primary/10 hover:bg-primary/5 hover:text-primary justify-between px-3 transition-all disabled:opacity-50"
                                    disabled={isProcessing}
                                >
                                    <span className="flex items-center gap-2">
                                        <RefreshCcw className={cn("h-3 w-3", isProcessing && "animate-spin")} />
                                        Rewrite
                                    </span>
                                    <ChevronDown className="h-3 w-3 opacity-40" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-background/95 backdrop-blur-md border-primary/10 rounded-xl shadow-2xl min-w-[180px]">
                                <DropdownMenuLabel className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 px-3 py-2">
                                    Select Style
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-primary/5" />
                                {rewriteStyles.length > 0 ? (
                                    rewriteStyles.map(({ label, style, description }) => (
                                        <DropdownMenuItem
                                            key={style}
                                            className="flex flex-col items-start py-2 px-3 focus:bg-primary/5 focus:text-primary cursor-pointer group"
                                            onSelect={() => handleRewrite(style)}
                                            disabled={isProcessing}
                                        >
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] group-hover:text-primary transition-colors">
                                                {label}
                                            </span>
                                            {description && isDesktop && (
                                                <span className="text-[7px] text-muted-foreground/40 mt-0.5">
                                                    {description}
                                                </span>
                                            )}
                                        </DropdownMenuItem>
                                    ))
                                ) : (
                                    <div className="p-3 text-[9px] text-muted-foreground italic uppercase tracking-widest text-center">
                                        Styles Unavailable
                                    </div>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <TooltipProvider delayDuration={300}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg border border-border/40 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-50"
                                        disabled={isProcessing}
                                        onClick={handleGrammar}
                                        aria-label="Fix grammar"
                                    >
                                        <Sparkles className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="text-[9px] font-black uppercase tracking-[0.2em]">
                                    Fix Grammar • Alt+G
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Quick Actions - Desktop only */}
                    {isDesktop && (
                        <div className="flex items-center gap-2 pt-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[8px] font-black uppercase tracking-[0.2em] rounded-md hover:bg-primary/5 flex-1"
                                disabled={isProcessing}
                                onClick={handleImprove}
                            >
                                <Zap className="h-2.5 w-2.5 mr-1" />
                                Improve Clarity
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[8px] font-black uppercase tracking-[0.2em] rounded-md hover:bg-primary/5 flex-1"
                                disabled={isProcessing}
                                onClick={handleHumanize}
                            >
                                <Languages className="h-2.5 w-2.5 mr-1" />
                                Make Natural
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Minimized State - Desktop only */}
            {isMinimized && isDesktop && (
                <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/60">
                            AI Selection Ready
                        </span>
                    </div>
                    <span className="text-[8px] font-mono text-muted-foreground/30">
                        {selection.selectionLength} chars
                    </span>
                </div>
            )}

            {/* Pipeline Status */}
            {!isMinimized && (
                <div className="px-4 py-2 border-t border-border/40 bg-background/40 flex items-center justify-between rounded-b-2xl">
                    <span className="text-[7px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 tabular-nums">
                        AI Selection Pipeline
                    </span>
                    <div className="flex items-center gap-2">
                        {isDesktop && (
                            <span className="text-[7px] font-mono text-muted-foreground/20">
                                Alt+Key
                            </span>
                        )}
                        <div className="h-1 w-1 rounded-full bg-primary/20" />
                    </div>
                </div>
            )}
        </div>
    );
};

export const SelectionGenerationHUD = React.memo(SelectionGenerationHUDComponent);

SelectionGenerationHUD.displayName = 'SelectionGenerationHUD';
