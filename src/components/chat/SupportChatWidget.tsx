
'use client';

import { AnimatedContainer, StaggeredAnimation } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { RawChatMessage, toast, useChatStore } from '@/hooks';
import app from '@/lib/core/firebase/client-init';
import { cn } from '@/lib/utils';
import { initiateSupportChat } from '@/services';
import { getDatabase, off, onValue, push, ref, serverTimestamp } from 'firebase/database';
import { Bot, ChevronDown, LifeBuoy, Loader2, MessageSquare, Send, Sparkles, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';


function Message({ role, content }: { role: 'user' | 'assistant', content: string }) {
    const isUser = role === 'user';
    const Icon = isUser ? User : Bot;
    const bubbleClasses = isUser
        ? 'bg-gradient-to-br from-primary to-primary-600 text-primary-foreground'
        : 'bg-gradient-to-br from-muted to-muted/80 border border-border/50';
    const justifyClass = isUser ? 'justify-end' : 'justify-start';

    return (
        <AnimatedContainer animation="fade-in-up" delay={100}>
            <div className={cn("flex items-start gap-3 group", justifyClass)}>
                {!isUser && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-soft">
                        <Icon className="h-4 w-4 text-white" />
                    </div>
                )}
                <div className={cn("p-3 rounded-2xl max-w-xs shadow-soft transition-all duration-200 group-hover:shadow-medium", bubbleClasses)}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
                </div>
                {isUser && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-secondary to-secondary-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-soft">
                        <Icon className="h-4 w-4 text-white" />
                    </div>
                )}
            </div>
        </AnimatedContainer>
    )
}


export default function SupportChatWidget() {
    const {
        isChatOpen,
        closeChat,
        toggleChat,
        getSelectedChat,
        setSelectedChatId,
        chats,
        createConversation,
        initialize,
        isInitialized,
        addMessage,
        unreadCounts,
    } = useChatStore();
    const selectedChat = getSelectedChat();
    const { firebaseUser, userProfile } = useAuth();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);


    // Initialize the store with server data once user is available
    useEffect(() => {
        if (firebaseUser && !isInitialized) {
            initialize(firebaseUser);
        }
    }, [firebaseUser, isInitialized, initialize]);

    useEffect(() => {
        if (!selectedChat) {
            setMessages([]);
            return;
        }

        const db = getDatabase(app);
        const messagesRef = ref(db, `messages/${selectedChat.id}`);

        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            const messagesList = data ? Object.values(data) : [];
            setMessages(messagesList as any[]);
        });

        return () => off(messagesRef, 'value', unsubscribe);

    }, [selectedChat]);


    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages]);

    const handleToggleChat = () => {
        if (!isChatOpen && !selectedChat) {
            const latestSupportChat = chats.find(c => c.isSupportChat) || null;
            setSelectedChatId(latestSupportChat?.id ?? null);
        }
        toggleChat();
    }


    const handleNewSupportChat = async () => {
        if (!firebaseUser || !userProfile) return;

        try {
            const token = await firebaseUser.getIdToken();
            const newConversation = await initiateSupportChat(token);
            createConversation(newConversation); // This will also select the new chat
        } catch (error: any) {
            toast({ title: 'Error starting chat', description: error.message, variant: 'destructive' });
        }
    }


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !firebaseUser || !selectedChat) return;

        setIsLoading(true);
        const messageToSend = input;
        setInput('');

        const messageData: RawChatMessage = {
            senderId: firebaseUser.uid,
            content: messageToSend,
            timestamp: serverTimestamp(),
            role: 'user' as 'user',
        };

        const db = getDatabase(app);
        const messagesRef = ref(db, `messages/${selectedChat.id}`);

        try {
            await push(messagesRef, messageData);
            addMessage(selectedChat.id, {
                ...messageData,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error("Failed to send message:", error);
            toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
            setInput(messageToSend); // Restore input on failure
        } finally {
            setIsLoading(false);
        }
    };

    const participants = selectedChat?.participantNames ? Object.values(selectedChat.participantNames) : [];
    const totalUnreadCount = Object.values(unreadCounts).reduce((acc, count) => acc + count, 0);

    if (!firebaseUser) {
        return null;
    }

    return (
        <>
            {!isChatOpen && (
                <AnimatedContainer animation="bounce-in" delay={200}>
                    <Button
                        onClick={handleToggleChat}
                        className="fixed bottom-8 right-8 rounded-full h-16 w-16 shadow-glow hover:shadow-glow-lg transition-all duration-200 hover:scale-105 z-50 bg-gradient-to-br from-primary to-primary-600"
                    >
                        <LifeBuoy className="h-8 w-8" />
                        {totalUnreadCount > 0 && (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-6 w-6 justify-center p-0 animate-pulse">
                                {totalUnreadCount}
                            </Badge>
                        )}
                    </Button>
                </AnimatedContainer>
            )}

            {isChatOpen && (
                <AnimatedContainer animation="fade-in-up" delay={200}>
                    <Card variant="glass" className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-[calc(100vw-2rem)] h-[calc(100vh-8rem)] sm:w-[400px] sm:h-[600px] shadow-glow z-50 flex flex-col backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-blue-500/5 border-b">
                            <div className="flex items-center gap-1">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="flex items-start gap-2 h-auto flex-col p-1 text-left hover:bg-primary/5 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                                                    <Bot className="h-4 w-4 text-white" />
                                                </div>
                                                <h2 className="text-lg font-headline font-semibold">{selectedChat?.title || 'Support Chat'}</h2>
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuLabel className="flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            Support Chats
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {chats.filter(c => c.isSupportChat).map(chat => (
                                            <DropdownMenuItem
                                                key={chat.id}
                                                onSelect={() => setSelectedChatId(chat.id)}
                                                className="hover:bg-primary/5 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                    {chat.title}
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onSelect={handleNewSupportChat}
                                            className="hover:bg-primary/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="h-4 w-4 text-primary" />
                                                New Support Chat
                                            </div>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <Button variant="ghost" size="icon" onClick={closeChat} className="hover:bg-destructive/10 hover:text-destructive transition-colors">
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>

                        {!selectedChat ? (
                            <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-background to-primary/5 p-8">
                                <AnimatedContainer animation="fade-in-up" delay={400}>
                                    <div className="text-center">
                                        <div className="p-4 rounded-full bg-gradient-to-br from-primary to-primary-600 shadow-glow mx-auto mb-4 w-fit">
                                            <LifeBuoy className="h-12 w-12 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-headline font-semibold mb-2">Welcome to Support</h2>
                                        <p className="text-muted-foreground max-w-sm mb-4">
                                            Start a new conversation to get help from our admin team.
                                        </p>
                                        <Button
                                            onClick={handleNewSupportChat}
                                            variant="gradient"
                                            className="hover:shadow-glow transition-all duration-200"
                                        >
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Start New Chat
                                        </Button>
                                    </div>
                                </AnimatedContainer>
                            </div>
                        ) : (
                            <>
                                <CardContent className="flex-grow overflow-hidden bg-gradient-to-b from-background to-primary/5">
                                    <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                                        <div className="space-y-4">
                                            <StaggeredAnimation animation="fade-in-up" staggerDelay={100}>
                                                {messages.map((message, index) => (
                                                    <Message
                                                        key={index}
                                                        role={message.senderId === firebaseUser?.uid ? 'user' : 'assistant'}
                                                        content={message.content}
                                                    />
                                                ))}
                                            </StaggeredAnimation>
                                            {isLoading && (
                                                <AnimatedContainer animation="fade-in-up" delay={200}>
                                                    <div className="flex items-start gap-3 justify-start">
                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shrink-0 shadow-soft">
                                                            <Bot className="h-4 w-4 text-white" />
                                                        </div>
                                                        <div className="p-3 rounded-2xl bg-gradient-to-br from-muted to-muted/80 border border-border/50 shadow-soft">
                                                            <div className="flex items-center gap-2">
                                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                                <span className="text-sm text-muted-foreground">Support is typing...</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </AnimatedContainer>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                                <CardFooter className="bg-gradient-to-r from-background to-primary/5 border-t">
                                    <AnimatedContainer animation="fade-in-up" delay={400}>
                                        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                                            <Textarea
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage(e);
                                                    }
                                                }}
                                                placeholder="Type your message..."
                                                className="min-h-0 rounded-2xl border border-input bg-background/50 backdrop-blur-sm shadow-soft focus:shadow-medium transition-all duration-200"
                                                rows={1}
                                                disabled={isLoading}
                                            />
                                            <Button
                                                type="submit"
                                                size="icon"
                                                disabled={!input.trim() || isLoading}
                                                className="rounded-full bg-gradient-to-br from-primary to-primary-600 hover:shadow-glow transition-all duration-200"
                                            >
                                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                            </Button>
                                        </form>
                                    </AnimatedContainer>
                                </CardFooter>
                            </>
                        )}
                    </Card>
                </AnimatedContainer>
            )}
        </>
    );
}
