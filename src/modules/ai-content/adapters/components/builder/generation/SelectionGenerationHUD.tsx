'use client';

import React, { useCallback } from 'react';
import { Sparkles, Wand2, Expand, RefreshCcw, ChevronDown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/infrastructure/utils/cn';
import { useEditorStore } from '@/modules/ai-content/adapters/state/use-editor-store';
import { useAiActions } from '@/modules/ai-content/adapters/hooks/report-mode/use-ai-actions';

/**
 * SelectionGenerationHUD — Floating AI toolkit for active text selections.
 * Provides micro-manipulations (Summarize, Expand, Rewrite) with high-fidelity glassmorphism.
 * 
 * DEFENSIVE MEASURES:
 * 1. Mode Isolation: Strictly restricts rendering to 'edit' mode with active selection.
 * 2. Guarded Handlers: Prevents AI actions if selection state is stale or missing.
 * 3. Type Safety: Validates rewrite styles and handles missing action hooks gracefully.
 * 4. UX Integrity: Disables all inputs during processing and provides visual feedback.
 */

interface SelectionGenerationHUDProps {
    viewMode: 'edit' | 'preview';
    className?: string;
}

const SelectionGenerationHUDComponent = ({ viewMode, className }: SelectionGenerationHUDProps) => {
    // 1. STATE RESOLUTION
    const selection = useEditorStore((state) => state.selection);
    const { isProcessing, handleAiAction, rewriteStyles = [] } = useAiActions();

    // 2. STABLE HANDLERS (with defensive checks)
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

    const handleRewrite = useCallback((style: string) => {
        if (!selection.hasSelection || !handleAiAction) return;
        handleAiAction('rewrite', { style });
    }, [handleAiAction, selection.hasSelection]);

    // 3. RENDER GUARDS
    if (viewMode !== 'edit' || !selection.hasSelection) return null;

    return (
        <div
            className={cn(
                'absolute right-6 top-6 z-40 w-[280px] rounded-2xl border border-border/40 bg-background/80 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] animate-in fade-in zoom-in-95 duration-300',
                className
            )}
        >
            {/* HUD Technical Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border/40 bg-primary/[0.02]">
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isProcessing ? "bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.4)]" : "bg-primary/60 shadow-[0_0_8px_rgba(var(--primary),0.2)]"
                    )} />
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-primary/70">
                        {isProcessing ? 'Neural Processing' : 'Selection Matrix'}
                    </p>
                </div>
                <Sparkles className={cn("h-3.5 w-3.5 transition-colors", isProcessing ? "text-amber-500" : "text-primary/60")} />
            </div>

            <div className="px-4 py-3 space-y-3">
                {/* Selection Digest */}
                <div className="relative group/digest">
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3 italic font-medium px-1">
                        "{selection.selectionText || 'No text captured'}"
                    </p>
                    <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-primary/10 rounded-full" />
                </div>

                {/* Primary Manipulation Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border border-primary/10 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-50"
                        disabled={isProcessing}
                        onClick={handleSummarize}
                    >
                        <Wand2 className="h-3 w-3" />
                        Summarize
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border border-primary/10 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-50"
                        disabled={isProcessing}
                        onClick={handleExpand}
                    >
                        <Expand className="h-3 w-3" />
                        Expand
                    </Button>
                </div>

                {/* Advanced Style Controller */}
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
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
                        <DropdownMenuContent className="bg-background/95 backdrop-blur-md border-primary/10 rounded-xl shadow-2xl min-w-[160px]">
                            {rewriteStyles.length > 0 ? (
                                rewriteStyles.map(({ label, style }) => (
                                    <DropdownMenuItem
                                        key={style}
                                        className="text-[10px] font-black uppercase tracking-[0.2em] py-2.5 focus:bg-primary/5 focus:text-primary cursor-pointer"
                                        onSelect={() => handleRewrite(style)}
                                        disabled={isProcessing}
                                    >
                                        {label}
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
                            <TooltipContent className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20">
                                Grammar Logic
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Stable Pipeline Footer */}
            <div className="px-4 py-2 border-t border-border/40 bg-background/40 flex items-center justify-between rounded-b-2xl">
                <span className="text-[7px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 tabular-nums">Selection Pipe STABLE</span>
                <div className="h-1 w-1 rounded-full bg-primary/20" />
            </div>
        </div>
    );
};

export const SelectionGenerationHUD = React.memo(SelectionGenerationHUDComponent);

SelectionGenerationHUD.displayName = 'SelectionGenerationHUD';
