'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Bot,
    Clock,
    Info,
    Phone,
    RotateCcw,
    Settings,
    Sparkles,
    Video
} from 'lucide-react';

interface ChatHeaderProps {
    title: string;
    subtitle?: string;
    avatar?: string;
    isOnline?: boolean;
    lastSeen?: string;
    isTyping?: boolean;
    isAgent?: boolean;
    onCall?: () => void;
    onVideoCall?: () => void;
    onInfo?: () => void;
    onSettings?: () => void;
    onReset?: () => void;
    className?: string;
    showActions?: boolean;
}

export function ChatHeader({
    title,
    subtitle,
    avatar,
    isOnline = false,
    lastSeen,
    isTyping = false,
    isAgent = false,
    onCall,
    onVideoCall,
    onInfo,
    onSettings,
    onReset,
    className,
    showActions = true
}: ChatHeaderProps) {
    return (
        <AnimatedContainer animation="fade-in-down" delay={200}>
            <div className={cn(
                "flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-blue-500/5",
                className
            )}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Avatar */}
                    <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                            <AvatarImage src={avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-600 text-white font-semibold">
                                {isAgent ? (
                                    <Bot className="h-5 w-5" />
                                ) : (
                                    title.charAt(0).toUpperCase()
                                )}
                            </AvatarFallback>
                        </Avatar>
                        {isOnline && (
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></div>
                        )}
                    </div>

                    {/* Title and Status */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-headline font-semibold truncate">{title}</h2>
                            {isAgent && (
                                <Badge variant="secondary" className="text-xs">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    AI
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                            {isTyping ? (
                                <div className="flex items-center gap-1">
                                    <div className="flex space-x-1">
                                        <div className="h-1 w-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="h-1 w-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="h-1 w-1 bg-primary rounded-full animate-bounce"></div>
                                    </div>
                                    <span className="text-xs text-primary">typing...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {isOnline ? 'Online' : 'Offline'}
                                    </Badge>
                                    {subtitle && (
                                        <span className="text-xs text-muted-foreground truncate">{subtitle}</span>
                                    )}
                                    {lastSeen && !isOnline && (
                                        <span className="text-xs text-muted-foreground">Last seen {lastSeen}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                {showActions && (
                    <div className="flex items-center gap-1">
                        {onCall && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:shadow-soft hover:bg-green-500/10 hover:text-green-600 transition-all duration-200"
                                onClick={onCall}
                            >
                                <Phone className="h-4 w-4" />
                            </Button>
                        )}

                        {onVideoCall && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:shadow-soft hover:bg-blue-500/10 hover:text-blue-600 transition-all duration-200"
                                onClick={onVideoCall}
                            >
                                <Video className="h-4 w-4" />
                            </Button>
                        )}

                        {onInfo && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:shadow-soft transition-all duration-200"
                                onClick={onInfo}
                            >
                                <Info className="h-4 w-4" />
                            </Button>
                        )}

                        {onSettings && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:shadow-soft transition-all duration-200"
                                onClick={onSettings}
                            >
                                <Settings className="h-4 w-4" />
                            </Button>
                        )}

                        {onReset && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:shadow-soft transition-all duration-200"
                                onClick={onReset}
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </AnimatedContainer>
    );
}
