'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';

interface ChatTypingIndicatorProps {
    className?: string;
    showAvatar?: boolean;
    message?: string;
}

export function ChatTypingIndicator({
    className,
    showAvatar = true,
    message = "AI is thinking..."
}: ChatTypingIndicatorProps) {
    return (
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <div className={cn("flex items-start gap-3 justify-start", className)}>
                {showAvatar && (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shrink-0 shadow-soft">
                        <Bot className="h-5 w-5 text-white" />
                    </div>
                )}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-muted to-muted/80 border border-border/50 shadow-soft">
                    <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                            <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">{message}</span>
                    </div>
                </div>
            </div>
        </AnimatedContainer>
    );
}
