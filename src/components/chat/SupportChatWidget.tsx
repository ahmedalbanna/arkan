
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, X, Bot, User, Loader2, LifeBuoy, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatStore } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { getDatabase, ref, onValue, off, push, serverTimestamp, update } from 'firebase/database';
import { app } from '@/lib';
import { RawChatMessage, RawChatSession } from '@/hooks';
import { initiateSupportChat } from '@/services';
import { toast } from '@/hooks';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';


function Message({ role, content }: { role: 'user' | 'assistant', content: string }) {
    const isUser = role === 'user';
    const Icon = isUser ? User : Bot;
    const bubbleClasses = isUser ? 'bg-primary text-primary-foreground' : 'bg-muted';
    const justifyClass = isUser ? 'justify-end' : 'justify-start';

    return (
        <div className={cn("flex items-start gap-3", justifyClass)}>
            {!isUser && (
                 <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5"/>
                </div>
            )}
            <div className={cn("p-3 rounded-lg max-w-lg", bubbleClasses)}>
                <p className="text-sm whitespace-pre-wrap">{content}</p>
            </div>
             {isUser && (
                 <div className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5"/>
                </div>
            )}
        </div>
    )
}


export default function SupportChatWidget() {
    const {
      isChatOpen,
      closeChat,
      toggleChat,
      selectedChat,
      setSelectedChat,
      getChats,
      createConversation,
      initialize,
      isInitialized,
      addMessage,
      unreadCounts,
    } = useChatStore();
    const chats = getChats();
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
            setSelectedChat(latestSupportChat?.toPlainObject() ?? null);
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
            <Button
                onClick={handleToggleChat}
                className="fixed bottom-8 right-8 rounded-full h-16 w-16 shadow-lg z-50"
            >
                <LifeBuoy className="h-8 w-8" />
                 {totalUnreadCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-6 w-6 justify-center p-0">{totalUnreadCount}</Badge>
                )}
            </Button>
        )}

        {isChatOpen && (
            <Card className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-[calc(100vw-2rem)] h-[calc(100vh-8rem)] sm:w-[400px] sm:h-[600px] shadow-lg z-50 flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between">
                     <div className="flex items-center gap-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-start gap-2 h-auto flex-col p-1 text-left">
                                    <div className="flex items-center gap-2">
                                        <Bot />
                                        <h2 className="text-lg font-semibold">{selectedChat?.title || 'Support Chat'}</h2>
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                             <DropdownMenuContent>
                                <DropdownMenuLabel>Support Chats</DropdownMenuLabel>
                                <DropdownMenuSeparator/>
                                {chats.filter(c => c.isSupportChat).map(chat => (
                                    <DropdownMenuItem key={chat.id} onSelect={() => setSelectedChat(chat.toPlainObject())}>
                                        {chat.title}
                                    </DropdownMenuItem>
                                ))}
                                 <DropdownMenuSeparator/>
                                 <DropdownMenuItem onSelect={handleNewSupportChat}>
                                    New Support Chat
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                     </div>

                    <Button variant="ghost" size="icon" onClick={closeChat}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                {!selectedChat ? (
                     <div className="flex h-full flex-col items-center justify-center bg-background p-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold">Welcome to Support</h2>
                            <p className="mt-2 text-muted-foreground max-w-sm">
                                Start a new conversation to get help from our admin team.
                            </p>
                            <Button onClick={handleNewSupportChat} className="mt-4">
                                Start New Chat
                            </Button>
                        </div>
                    </div>
                ) : (
                <>
                    <CardContent className="flex-grow overflow-hidden">
                        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                            <div className="space-y-4">
                                {messages.map((message, index) => (
                                    <Message key={index} role={message.senderId === firebaseUser?.uid ? 'user' : 'assistant'} content={message.content} />
                                ))}
                                {isLoading && (
                                    <div className="flex items-start gap-3 justify-start">
                                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                                            <Bot className="h-5 w-5"/>
                                        </div>
                                        <div className="p-3 rounded-lg bg-muted">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter>
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
                                className="min-h-0"
                                rows={1}
                                disabled={isLoading}
                            />
                            <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </form>
                    </CardFooter>
                </>
                )}
            </Card>
        )}
      </>
    );
}
