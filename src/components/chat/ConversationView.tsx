'use client';

import { AnimatedContainer, StaggeredAnimation } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/core/utils/authUtils';
import { useAgentChat } from '@/hooks';
import { Chat } from '@/lib/models/chat';
import { cn } from '@/lib/utils';
import { getDatabase, off, onValue, orderByChild, query, ref } from 'firebase/database';
import { Bot, Clock, Info, Loader2, MessageSquare, Paperclip, RotateCcw, Send, Settings2, Sparkles, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

function MessageBubble({ role, content, timestamp }: { role: 'user' | 'assistant', content: string, timestamp?: number }) {
    const isUser = role === 'user';
    const Icon = isUser ? User : Bot;

    return (
        <AnimatedContainer animation="fade-in-up" delay={100}>
            <div className={cn("flex items-start gap-3 group", isUser && "justify-end")}>
                {!isUser && (
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
                    {timestamp && (
                        <div className={cn(
                            "text-xs mt-2 opacity-70",
                            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        )}>
                            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    )}
                </div>
                {isUser && (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-secondary to-secondary-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-soft">
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                )}
            </div>
        </AnimatedContainer>
    )
}

export function ConversationView({ chat }: { chat: Chat | null }) {
    const { firebaseUser } = useAuth();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chat) {
            setMessages([]);
            return;
        }

        const db = getDatabase();
        const messagesRef = query(ref(db, `messages/${chat.id}`), orderByChild('timestamp'));

        const listener = onValue(messagesRef, (snapshot) => {
            const messagesData = snapshot.val();
            if (messagesData) {
                const messagesList: ChatMessage[] = Object.entries(
                    messagesData
                ).map(([id, msgData]) => ({ id, ...(msgData as Omit<ChatMessage, 'id'>) }));
                setMessages(messagesList);
            } else {
                setMessages([]);
            }
        });

        return () => {
            off(messagesRef, 'value', listener);
        };

    }, [chat]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages]);

    const agentChatMutation = useAgentChat();

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !firebaseUser || !chat) return;

        const messageContent = input;
        setInput('');

        const token = await getAuthenticatedToken(firebaseUser);
        const agentId = chat.agent?.id || 'user-chat';

        agentChatMutation.mutate({
            agentId: agentId,
            message: messageContent,
            conversationId: chat.id,
            token
        });
    }

    if (!chat) {
        return (
            <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-background to-primary/5 p-8">
                <AnimatedContainer animation="fade-in-up" delay={200}>
                    <Card variant="glass" className="p-8 text-center max-w-md">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 rounded-full bg-gradient-to-br from-primary to-primary-600 shadow-glow">
                                <MessageSquare className="h-12 w-12 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-headline font-semibold mb-2">Select a Conversation</h2>
                                <p className="text-muted-foreground">
                                    Choose a conversation or an agent from the sidebar to get started with AI-powered chat.
                                </p>
                            </div>
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                AI-Powered Chat
                            </Badge>
                        </div>
                    </Card>
                </AnimatedContainer>
            </div>
        );
    }

    const isLoading = agentChatMutation.isPending;

    return (
        <div className="flex h-full flex-col bg-gradient-to-b from-background to-primary/5">
            <AnimatedContainer animation="fade-in-down" delay={200}>
                <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-primary/5 to-blue-500/5 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                            <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-headline font-semibold">{chat.title}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Active
                                </Badge>
                                {chat.agent && (
                                    <Badge variant="outline" className="text-xs">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        AI Agent
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:shadow-soft transition-all duration-200">
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
            </AnimatedContainer>

            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-6">
                    <StaggeredAnimation animation="fade-in-up" staggerDelay={100}>
                        {messages.map((msg, index) => (
                            <MessageBubble
                                key={index}
                                role={msg.role}
                                content={msg.content}
                                timestamp={msg.timestamp}
                            />
                        ))}
                    </StaggeredAnimation>
                    {isLoading && (
                        <AnimatedContainer animation="fade-in-up" delay={200}>
                            <div className="flex items-start gap-3 justify-start">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shrink-0 shadow-soft">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-muted to-muted/80 border border-border/50 shadow-soft">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                                    </div>
                                </div>
                            </div>
                        </AnimatedContainer>
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t bg-gradient-to-r from-background to-primary/5">
                <AnimatedContainer animation="fade-in-up" delay={400}>
                    <form onSubmit={handleSendMessage}>
                        <div className="relative">
                            <Textarea
                                placeholder={`Chat with ${chat.title}...`}
                                className="w-full resize-none rounded-2xl border border-input bg-background/50 backdrop-blur-sm pr-16 py-3 shadow-soft focus:shadow-medium transition-all duration-200"
                                rows={1}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-600 text-primary-foreground hover:shadow-glow transition-all duration-200"
                                disabled={!input.trim() || isLoading}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                    <div className="flex items-center gap-2 mt-3">
                        <Button variant="outline" size="sm" className="gap-1.5 hover:shadow-soft transition-all duration-200">
                            <Settings2 className="h-4 w-4" />
                            <span className="hidden sm:inline">General</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:shadow-soft transition-all duration-200">
                            <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:shadow-soft transition-all duration-200">
                            <Info className="h-4 w-4" />
                        </Button>
                    </div>
                </AnimatedContainer>
            </div>
        </div>
    );
}
