'use client';

import React, { useCallback } from 'react';
import { Sparkles, Wand2, Expand, RefreshCcw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/infrastructure/utils/cn';
import { useEditorStore } from '@/modules/ai-content/adapters/state/use-editor-store';
import { useAiActions } from '@/modules/ai-content/adapters/hooks/report-mode/use-ai-actions';

interface SelectionGenerationHUDProps {
    viewMode: 'edit' | 'preview';
    className?: string;
}

const SelectionGenerationHUDComponent = ({ viewMode, className }: SelectionGenerationHUDProps) => {
    const selection = useEditorStore((state) => state.selection);
    const { isProcessing, handleAiAction, rewriteStyles } = useAiActions();

    const handleSummarize = useCallback(() => handleAiAction('summarize'), [handleAiAction]);
    const handleExpand = useCallback(() => handleAiAction('expand'), [handleAiAction]);
    const handleGrammar = useCallback(() => handleAiAction('grammar'), [handleAiAction]);
    const handleRewrite = useCallback((style: string) => handleAiAction('rewrite', { style }), [handleAiAction]);

    if (viewMode !== 'edit' || !selection.hasSelection) return null;

    return (
        <div
            className={cn(
                'absolute right-6 top-6 z-40 w-[280px] rounded-2xl border border-border/40 bg-background/80 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)]',
                className
            )}
        >
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border/40">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-pulse" />
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-primary/70">Selection Tools</p>
                </div>
                <Sparkles className="h-4 w-4 text-primary/60" />
            </div>

            <div className="px-4 py-3 space-y-3">
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3 italic">
                    {selection.selectionText}
                </p>

                <div className="grid grid-cols-2 gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border border-primary/10 hover:bg-primary/5 hover:text-primary"
                        disabled={isProcessing}
                        onClick={handleSummarize}
                    >
                        <Wand2 className="h-3.5 w-3.5" />
                        Summarize
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border border-primary/10 hover:bg-primary/5 hover:text-primary"
                        disabled={isProcessing}
                        onClick={handleExpand}
                    >
                        <Expand className="h-3.5 w-3.5" />
                        Expand
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 flex-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border border-primary/10 hover:bg-primary/5 hover:text-primary justify-between"
                                disabled={isProcessing}
                            >
                                <span className="flex items-center gap-2">
                                    <RefreshCcw className="h-3.5 w-3.5" />
                                    Rewrite
                                </span>
                                <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-background/95 backdrop-blur-md border-primary/10">
                            {rewriteStyles.map(({ label, style }) => (
                                <DropdownMenuItem
                                    key={style}
                                    className="text-[10px] font-black uppercase tracking-[0.2em]"
                                    onSelect={() => handleRewrite(style)}
                                    disabled={isProcessing}
                                >
                                    {label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg border border-border/40"
                                    disabled={isProcessing}
                                    onClick={handleGrammar}
                                    aria-label="Fix grammar"
                                >
                                    <Sparkles className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="text-[9px] font-black uppercase tracking-[0.2em]">
                                Grammar
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    );
};

export const SelectionGenerationHUD = React.memo(SelectionGenerationHUDComponent);

SelectionGenerationHUD.displayName = 'SelectionGenerationHUD';
