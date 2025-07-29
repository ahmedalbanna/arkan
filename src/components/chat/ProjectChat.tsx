'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { useChatStore } from '@/hooks/useChatStore';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { getDatabase, ref, onValue, off, push } from 'firebase/database';
import { app } from '@/lib/firebase';

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
                <p className="text-sm">{content}</p>
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
    const { isChatOpen, closeChat, toggleChat, selectedChat } = useChatStore();
    const { firebaseUser } = useAuth();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const participants = selectedChat?.participantNames ? Object.values(selectedChat.participantNames) : [];

     useEffect(() => {
        if (!selectedChat) return;

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

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !firebaseUser || !selectedChat) return;
        
        const messageData = {
            senderId: firebaseUser.uid,
            content: input,
            timestamp: new Date().toISOString(),
            role: 'user',
        };
        
        const db = getDatabase(app);
        const messagesRef = ref(db, `messages/${selectedChat.id}`);
        
        try {
            await push(messagesRef, messageData);
            setInput('');
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };
    

    return (
      <>
        {!isChatOpen && (
            <Button
                onClick={toggleChat}
                className="fixed bottom-8 right-8 rounded-full h-16 w-16 shadow-lg z-50"
            >
                <MessageSquare className="h-8 w-8" />
            </Button>
        )}
        
        {isChatOpen && (
            <Card className="fixed bottom-8 right-8 w-[400px] h-[600px] shadow-lg z-50 flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between">
                     <div className="flex flex-col">
                        <CardTitle className="flex items-center gap-2 font-headline">
                            <Bot />
                            {selectedChat?.title || 'Support Chat'}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                            Participants: {participants.join(', ')}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={closeChat}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden">
                    <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                        <div className="space-y-4">
                            {messages.map((message, index) => (
                                <Message key={index} role={message.role} content={message.content} />
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
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        )}
      </>
    );
}