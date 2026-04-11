'use client';

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/infrastructure/utils/cn";
import type { DiffPart } from "@/modules/projects/domain/utils/diff";
import { Check, Copy, Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useState } from "react";

interface DiffViewProps {
    diff: DiffPart[];
    showLineNumbers?: boolean;
    className?: string;
}

export const DiffView = ({ diff, showLineNumbers = true, className }: DiffViewProps) => {
    const [copied, setCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [hoveredLine, setHoveredLine] = useState<number | null>(null);

    // Generate line numbers
    const lines = diff.flatMap(part => part.value.split('\n')).filter(line => line !== '');
    const totalLines = lines.length;

    const handleCopy = useCallback(async () => {
        const fullText = diff.map(part => part.value).join('');
        await navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [diff]);

    const handleCopyLine = useCallback(async (line: string) => {
        await navigator.clipboard.writeText(line);
        // Could add line-specific feedback
    }, []);

    // Calculate diff statistics
    const stats = {
        additions: diff.filter(part => part.type === 'added').reduce((acc, part) => acc + part.value.length, 0),
        deletions: diff.filter(part => part.type === 'removed').reduce((acc, part) => acc + part.value.length, 0),
        unchanged: diff.filter(part => !part.type || part.type === 'unchanged').reduce((acc, part) => acc + part.value.length, 0),
    };

    // Build content with line numbers
    let lineNumber = 1;
    const contentWithLines: { lineNum: number; content: string; type?: string }[] = [];

    diff.forEach(part => {
        const partLines = part.value.split('\n');
        partLines.forEach((line, idx) => {
            if (line !== '' || idx < partLines.length - 1) {
                contentWithLines.push({
                    lineNum: lineNumber++,
                    content: line,
                    type: part.type
                });
            }
        });
    });

    return (
        <div className={cn("relative group/diff", className)}>
            {/* Diff Controls */}
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover/diff:opacity-100 transition-opacity">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="h-7 w-7 rounded-md bg-background/80 backdrop-blur-sm"
                            >
                                {isExpanded ? (
                                    <Minimize2 className="h-3.5 w-3.5" />
                                ) : (
                                    <Maximize2 className="h-3.5 w-3.5" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[8px]">
                            {isExpanded ? 'Collapse' : 'Expand'}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCopy}
                                className="h-7 w-7 rounded-md bg-background/80 backdrop-blur-sm"
                            >
                                {copied ? (
                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[8px]">
                            Copy diff
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Diff Stats Bar */}
            <div className="mb-3 flex items-center gap-3 text-[8px] font-mono">
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-green-600 dark:text-green-400">+{stats.additions}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-red-600 dark:text-red-400">-{stats.deletions}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground/40">{totalLines} lines</span>
                </div>
            </div>

            {/* Diff Content */}
            <div className={cn(
                "whitespace-pre-wrap text-[13px] leading-relaxed font-mono rounded-xl bg-muted/5 border border-border/40 shadow-inner overflow-auto transition-all duration-300",
                isExpanded ? "max-h-[70vh]" : "max-h-[400px]"
            )}>
                <div className="relative">
                    {showLineNumbers && (
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted/10 border-r border-border/40 select-none pointer-events-none">
                            {contentWithLines.map((item, idx) => (
                                <div
                                    key={`line-num-${idx}`}
                                    className="text-right pr-2 text-[10px] text-muted-foreground/30 font-mono leading-relaxed"
                                    style={{ lineHeight: '1.625rem' }}
                                >
                                    {item.lineNum}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={cn(showLineNumbers && "pl-14")}>
                        {diff.map((part, partIndex) => {
                            const lines = part.value.split('\n');
                            return lines.map((line, lineIndex) => {
                                const isLastLine = lineIndex === lines.length - 1;
                                return (
                                    <div
                                        key={`${partIndex}-${lineIndex}`}
                                        className={cn(
                                            "transition-colors duration-150 group/line",
                                            {
                                                'bg-green-500/5 hover:bg-green-500/10': part.type === 'added',
                                                'bg-red-500/5 hover:bg-red-500/10': part.type === 'removed',
                                                'hover:bg-muted/20': !part.type || part.type === 'unchanged'
                                            }
                                        )}
                                        onMouseEnter={() => setHoveredLine(partIndex * 1000 + lineIndex)}
                                        onMouseLeave={() => setHoveredLine(null)}
                                    >
                                        <div className="flex items-start">
                                            <span className={cn(
                                                "flex-1 py-0.5 px-1",
                                                {
                                                    'bg-green-500/10 text-green-600 dark:text-green-400 font-bold border-l-2 border-green-500': part.type === 'added',
                                                    'bg-red-500/10 text-red-600 dark:text-red-400 line-through decoration-red-400/60': part.type === 'removed',
                                                    'text-muted-foreground/80': !part.type || part.type === 'unchanged'
                                                }
                                            )}>
                                                {line || (isLastLine ? null : ' ')}
                                            </span>

                                            {/* Copy line button on hover */}
                                            {line && (
                                                <button
                                                    onClick={() => handleCopyLine(line)}
                                                    className="opacity-0 group-hover/line:opacity-100 transition-opacity mr-2 p-0.5 rounded hover:bg-muted/50"
                                                >
                                                    <Copy className="h-3 w-3 text-muted-foreground/40" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            });
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
