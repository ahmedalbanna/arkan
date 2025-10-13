'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { cn } from '@/lib/utils';
import { AlertCircle, Bot, CheckCircle, Clock, User } from 'lucide-react';

interface ChatMessageProps {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: number;
    status?: 'sending' | 'sent' | 'delivered' | 'failed';
    className?: string;
    showAvatar?: boolean;
    showTimestamp?: boolean;
    showStatus?: boolean;
}

export function ChatMessage({
    role,
    content,
    timestamp,
    status = 'sent',
    className,
    showAvatar = true,
    showTimestamp = true,
    showStatus = false
}: ChatMessageProps) {
    const isUser = role === 'user';
    const Icon = isUser ? User : Bot;

    const getStatusIcon = () => {
        switch (status) {
            case 'sending':
                return <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />;
            case 'sent':
                return <CheckCircle className="h-3 w-3 text-muted-foreground" />;
            case 'delivered':
                return <CheckCircle className="h-3 w-3 text-primary" />;
            case 'failed':
                return <AlertCircle className="h-3 w-3 text-destructive" />;
            default:
                return null;
        }
    };

    return (
        <AnimatedContainer animation="fade-in-up" delay={100}>
            <div className={cn("flex items-start gap-3 group", isUser && "justify-end", className)}>
                {!isUser && showAvatar && (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-soft">
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                )}
                <div className={cn(
                    "relative p-4 rounded-2xl max-w-lg shadow-soft transition-all duration-200 group-hover:shadow-medium",
                    isUser
                        ? 'bg-gradient-to-br from-primary to-primary-600 text-primary-foreground'
                        : 'bg-gradient-to-br from-muted to-muted/80 border border-border/50'
                )}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>

                    {(showTimestamp || showStatus) && (
                        <div className={cn(
                            "flex items-center gap-2 mt-2 text-xs",
                            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        )}>
                            {showTimestamp && timestamp && (
                                <span>{new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            )}
                            {showStatus && isUser && (
                                <div className="flex items-center gap-1">
                                    {getStatusIcon()}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {isUser && showAvatar && (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-secondary to-secondary-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-soft">
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                )}
            </div>
        </AnimatedContainer>
    );
}
