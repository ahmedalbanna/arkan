'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    ArrowRight,
    Bot,
    Lightbulb,
    MessageSquare,
    Sparkles,
    Users
} from 'lucide-react';

interface ChatEmptyStateProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    actionText?: string;
    onAction?: () => void;
    suggestions?: string[];
    onSuggestionClick?: (suggestion: string) => void;
    className?: string;
    variant?: 'default' | 'agent' | 'support';
}

export function ChatEmptyState({
    title = "Start a conversation",
    description = "Send a message to begin chatting",
    icon,
    actionText,
    onAction,
    suggestions = [],
    onSuggestionClick,
    className,
    variant = 'default'
}: ChatEmptyStateProps) {
    const getDefaultIcon = () => {
        switch (variant) {
            case 'agent':
                return <Bot className="h-12 w-12 text-white" />;
            case 'support':
                return <Users className="h-12 w-12 text-white" />;
            default:
                return <MessageSquare className="h-12 w-12 text-white" />;
        }
    };

    const getDefaultTitle = () => {
        switch (variant) {
            case 'agent':
                return "Chat with AI Agent";
            case 'support':
                return "Contact Support";
            default:
                return "Start a conversation";
        }
    };

    const getDefaultDescription = () => {
        switch (variant) {
            case 'agent':
                return "Ask questions and get intelligent responses from our AI agent";
            case 'support':
                return "Get help from our support team";
            default:
                return "Send a message to begin chatting";
        }
    };

    const getDefaultSuggestions = () => {
        switch (variant) {
            case 'agent':
                return [
                    "What can you help me with?",
                    "Explain this concept to me",
                    "Help me solve this problem",
                    "Generate some ideas"
                ];
            case 'support':
                return [
                    "I need help with my account",
                    "How do I reset my password?",
                    "I'm having technical issues",
                    "I want to upgrade my plan"
                ];
            default:
                return [
                    "Hello!",
                    "How are you?",
                    "What's new?",
                    "Tell me more"
                ];
        }
    };

    const displayIcon = icon || getDefaultIcon();
    const displayTitle = title === "Start a conversation" ? getDefaultTitle() : title;
    const displayDescription = description === "Send a message to begin chatting" ? getDefaultDescription() : description;
    const displaySuggestions = suggestions.length > 0 ? suggestions : getDefaultSuggestions();

    return (
        <div className={cn("flex h-full flex-col items-center justify-center p-8", className)}>
            <AnimatedContainer animation="fade-in-up" delay={200}>
                <Card variant="glass" className="p-8 text-center max-w-md">
                    <div className="flex flex-col items-center gap-4">
                        {/* Icon */}
                        <div className="p-4 rounded-full bg-gradient-to-br from-primary to-primary-600 shadow-glow">
                            {displayIcon}
                        </div>

                        {/* Title and Description */}
                        <div>
                            <h2 className="text-2xl font-headline font-semibold mb-2">{displayTitle}</h2>
                            <p className="text-muted-foreground mb-4">{displayDescription}</p>
                        </div>

                        {/* Badge */}
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            {variant === 'agent' ? 'AI-Powered' : variant === 'support' ? 'Live Support' : 'Ready to Chat'}
                        </Badge>

                        {/* Action Button */}
                        {actionText && onAction && (
                            <Button
                                onClick={onAction}
                                variant="gradient"
                                className="hover:shadow-glow transition-all duration-200"
                            >
                                {actionText}
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        )}

                        {/* Suggestions */}
                        {displaySuggestions.length > 0 && onSuggestionClick && (
                            <div className="w-full mt-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Lightbulb className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Suggested messages:</span>
                                </div>
                                <div className="grid gap-2">
                                    {displaySuggestions.map((suggestion, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            className="justify-start text-left h-auto p-3 hover:bg-primary/5 hover:border-primary/20 transition-all duration-200"
                                            onClick={() => onSuggestionClick(suggestion)}
                                        >
                                            <span className="text-sm">{suggestion}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </AnimatedContainer>
        </div>
    );
}
