'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/infrastructure/utils/cn';
import { markdownComponents } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';

/**
 * ChatMessage — A shared high-fidelity component for AI and User interactions.
 * Implements role-specific aesthetics, glassmorphism, and professional prose.
 */

interface ChatMessageProps {
    role: 'assistant' | 'user';
    content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
    const isAssistant = role === 'assistant';

    return (
        <div className={cn(
            "flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500",
            !isAssistant && "flex-row-reverse"
        )}>
            {/* Avatar HUD */}
            <div className={cn(
                "h-8 w-8 shrink-0 rounded-xl flex items-center justify-center text-[10px] shadow-md border transition-all duration-500 group-hover:scale-110",
                isAssistant 
                    ? "bg-primary/10 border-primary/20 text-primary" 
                    : "bg-background border-border/40 text-muted-foreground font-black"
            )}>
                {isAssistant ? '🤖' : 'U'}
            </div>

            {/* Message Bubble — Intelligence Suite Glassmorphism */}
            <div className={cn(
                "max-w-[88%] p-4 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border transition-all duration-300",
                isAssistant
                    ? "bg-background/60 backdrop-blur-2xl border-primary/10 rounded-tl-none font-serif italic leading-relaxed text-muted-foreground hover:text-foreground hover:border-primary/20"
                    : "bg-primary text-primary-foreground border-primary/20 rounded-tr-none font-sans font-medium shadow-primary/10"
            )}>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
                </div>
                
                {/* Meta Indicator (Assistant only) */}
                {isAssistant && (
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-primary/5 opacity-40">
                        <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                        <span className="text-[7px] font-black uppercase tracking-widest">Cognitive Output</span>
                    </div>
                )}
            </div>
        </div>
    );
}
