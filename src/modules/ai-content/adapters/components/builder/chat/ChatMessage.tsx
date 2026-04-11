'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMobile } from '@/hooks/util/use-mobile';
import { cn } from '@/infrastructure/utils/cn';
import { markdownComponents } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';
import { Check, Copy, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
    role: 'assistant' | 'user';
    content: string;
    isStreaming?: boolean;
    onFeedback?: (type: 'helpful' | 'not-helpful') => void;
}

export function ChatMessage({ role, content, isStreaming, onFeedback }: ChatMessageProps) {
    const isAssistant = role === 'assistant';
    const isDesktop = !useMobile();
    const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFeedback = (type: 'helpful' | 'not-helpful') => {
        setFeedback(type);
        onFeedback?.(type);
    };

    // Truncate long user messages for display
    const displayContent = !isAssistant && content.length > 500 && !isDesktop
        ? content.substring(0, 500) + '...'
        : content;

    return (
        <div className={cn(
            "flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 group",
            !isAssistant && "flex-row-reverse"
        )}>
            {/* Avatar */}
            <div className={cn(
                "h-8 w-8 shrink-0 rounded-xl flex items-center justify-center shadow-md border transition-all duration-500",
                isAssistant
                    ? "bg-primary/10 border-primary/20 text-primary"
                    : "bg-background border-border/40 text-muted-foreground font-black"
            )}>
                {isAssistant ? (
                    <Sparkles className="h-4 w-4" />
                ) : (
                    <span className="text-[10px] font-black">U</span>
                )}
            </div>

            {/* Message Bubble */}
            <div className={cn(
                "max-w-[85%] rounded-2xl shadow-sm transition-all duration-300 relative",
                isAssistant
                    ? "bg-background/80 backdrop-blur-sm border border-primary/10 rounded-tl-none"
                    : "bg-primary text-primary-foreground border border-primary/20 rounded-tr-none",
                isStreaming && "animate-pulse"
            )}>
                <div className={cn(
                    "p-4",
                    isAssistant ? "font-serif" : "font-sans"
                )}>
                    <div className={cn(
                        "prose prose-sm dark:prose-invert max-w-none",
                        isAssistant && "prose-headings:text-foreground prose-p:text-muted-foreground"
                    )}>
                        <ReactMarkdown components={markdownComponents}>
                            {displayContent}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* Action Buttons - Desktop Assistant Only */}
                {isDesktop && isAssistant && !isStreaming && (
                    <div className="absolute -bottom-8 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleCopy}
                                        className="h-6 w-6 rounded-md"
                                    >
                                        {copied ? (
                                            <Check className="h-3 w-3 text-green-500" />
                                        ) : (
                                            <Copy className="h-3 w-3 text-muted-foreground/40" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-[8px]">
                                    Copy response
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {onFeedback && (
                            <>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleFeedback('helpful')}
                                                className={cn(
                                                    "h-6 w-6 rounded-md",
                                                    feedback === 'helpful' && "text-green-500"
                                                )}
                                            >
                                                <ThumbsUp className="h-3 w-3" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-[8px]">
                                            Helpful
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleFeedback('not-helpful')}
                                                className={cn(
                                                    "h-6 w-6 rounded-md",
                                                    feedback === 'not-helpful' && "text-red-500"
                                                )}
                                            >
                                                <ThumbsDown className="h-3 w-3" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-[8px]">
                                            Not helpful
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </>
                        )}
                    </div>
                )}

                {/* Meta Indicator for Assistant */}
                {isAssistant && !isStreaming && (
                    <div className="px-4 pb-3 pt-0">
                        <div className="flex items-center gap-2 opacity-30">
                            <div className="h-1 w-1 rounded-full bg-primary" />
                            <span className="text-[6px] font-black uppercase tracking-widest">
                                AI Generated
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
