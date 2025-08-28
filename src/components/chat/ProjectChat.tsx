
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatStore } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/hooks';
import { runFlow } from '@genkit-ai/next/client';
import { projectChat } from '@/ai/flows/project-chat';

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


export default function ProjectChat() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const getFullState = useBuilderStore(state => state.getFullState);

    const handleToggleChat = () => setIsChatOpen(prev => !prev);
    const handleCloseChat = () => setIsChatOpen(false);

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
        if (!input.trim() || isRunning) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);

        const projectState = getFullState();
        setInput('');
        setIsRunning(true);

        try {
            const flow = await runFlow({
                input: input,
                url: ''
            });

            let finalContent = '';
            for await (const chunk of flow.stream()) {
                if (chunk.output) {
                    finalContent += chunk.output.text || JSON.stringify(chunk.output.toolRequest, null, 2);
                }
            }
            if (finalContent) {
                const assistantMessage = { role: 'assistant', content: finalContent };
                setMessages(prev => [...prev, assistantMessage]);
            }
        } catch (error) {
            console.error(error);
            const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsRunning(false);
        }
    };

    return (
      <>
        {!isChatOpen && (
            <Button
                onClick={handleToggleChat}
                className="fixed bottom-8 right-8 rounded-full h-16 w-16 shadow-lg z-50"
            >
                <MessageSquare className="h-8 w-8" />
            </Button>
        )}

        {isChatOpen && (
            <Card className="fixed bottom-8 right-8 w-[400px] h-[600px] shadow-lg z-50 flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <Bot />
                        Project Assistant
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={handleCloseChat}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden">
                    <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                        <div className="space-y-4">
                            {messages.map((message, index) => (
                                <Message key={index} role={message.role} content={message.content} />
                            ))}
                            {isRunning && messages[messages.length - 1]?.role === 'user' && (
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
                            placeholder="e.g., Change the title..."
                            className="min-h-0"
                            rows={1}
                            disabled={isRunning}
                        />
                        <Button type="submit" size="icon" disabled={!input.trim() || isRunning}>
                            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        )}
      </>
    );
}
