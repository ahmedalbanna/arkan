'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/infrastructure/utils/cn';
import { Send, Sparkles, StopCircle } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading: boolean;
    placeholder?: string;
    className?: string;
    onStop?: () => void;
}

export function ChatInput({ onSend, isLoading, placeholder, className, onStop }: ChatInputProps) {
    const [value, setValue] = useState('');
    const [rows, setRows] = useState(1);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (value.trim() && !isLoading) {
            onSend(value.trim());
            setValue('');
            setRows(1);
        }
    };

    const handleStop = () => {
        onStop?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (true) {
            // Ctrl/Cmd + Enter to send
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSend();
            }
            // Escape to clear
            if (e.key === 'Escape' && value) {
                e.preventDefault();
                setValue('');
            }
        } else {
            // Mobile: Enter sends, Shift+Enter for new line
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 120);
        textarea.style.height = `${newHeight}px`;
        setRows(Math.min(Math.ceil(newHeight / 24), 5));
    }, [value]);

    // Focus on mount
    useEffect(() => {
        if ( textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    return (
        <div className={cn(
            "p-4 pt-2 border-t border-primary/10 bg-background/80 backdrop-blur-sm relative",
            className
        )}>
            {/* Input Area */}
            <div className="relative group/input">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl blur opacity-0 group-focus-within/input:opacity-100 transition duration-500" />

                <div className="relative flex items-end gap-2">
                    <Textarea
                        ref={textareaRef}
                        placeholder={placeholder || ("Ask Arkan AI...")}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={rows}
                        className={cn(
                            "flex-1 resize-none bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl text-[11px] font-medium leading-relaxed shadow-inner transition-all p-3 custom-scrollbar",
                            "min-h-[40px] max-h-[120px]"
                        )}
                        disabled={isLoading}
                    />

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-1.5">
                        {isLoading && onStop ? (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            onClick={handleStop}
                                            className="h-9 w-9 rounded-xl shadow-lg"
                                        >
                                            <StopCircle className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-[8px]">
                                        Stop generating
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            className={cn(
                                                "h-9 w-9 rounded-xl shadow-lg transition-all duration-300",
                                                value.trim() && !isLoading
                                                    ? "bg-primary text-primary-foreground shadow-primary/30 scale-100"
                                                    : "bg-muted/20 text-muted-foreground/40 scale-95 opacity-50"
                                            )}
                                            onClick={handleSend}
                                            disabled={isLoading || !value.trim()}
                                        >
                                            <Send className="h-4 w-4 transition-transform group-hover/input:translate-x-0.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-[8px]">
                                        Send message • {'⌘⏎'}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 opacity-30">
                    <Sparkles className="h-2.5 w-2.5 text-primary" />
                    <p className="text-[7px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                        {'Project Intelligence Interface'}
                    </p>
                </div>
                {value && !isLoading && (
                    <p className="text-[6px] font-mono text-muted-foreground/30">
                        {value.length} characters
                    </p>
                )}
            </div>
        </div>
    );
}
