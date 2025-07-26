
'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { useChatStore } from '@/hooks/useChatStore';
import { useAuth } from '@/context/AuthContext';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// API function
async function sendChatMessage(variables: { message: string, projectState: any, token: string }) {
    const response = await fetch('/api/project-chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${variables.token}`
        },
        body: JSON.stringify({
            message: variables.message,
            projectState: variables.projectState,
        }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get response from AI');
    }
    return response.json();
}


export default function ProjectChat() {
    const [isOpen, setIsOpen] = useState(false);
    const { messages, addMessage, input, setInput } = useChatStore();
    const { firebaseUser, refetchUser } = useAuth();
    const getFullState = useBuilderStore(s => s.getFullState);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: sendChatMessage,
        onSuccess: (data) => {
            addMessage({ role: 'assistant', content: data.response });
            refetchUser(); // Update credits
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        }
    });

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !firebaseUser) return;
        
        const userMessage = { role: 'user' as const, content: input };
        addMessage(userMessage);
        setInput('');

        const token = await firebaseUser.getIdToken();
        const projectState = getFullState();

        mutation.mutate({ message: input, projectState, token });
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 rounded-full h-16 w-16 shadow-lg z-50"
            >
                <MessageSquare className="h-8 w-8" />
            </Button>
        );
    }

    return (
        <Card className="fixed bottom-8 right-8 w-[400px] h-[600px] shadow-lg z-50 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Bot />
                    AI Project Assistant
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
                <ScrollArea className="h-full pr-4">
                    <div className="space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex items-start gap-3",
                                    message.role === 'user' ? 'justify-end' : 'justify-start'
                                )}
                            >
                                {message.role === 'assistant' && <Avatar className="bg-primary text-primary-foreground"><Bot /></Avatar>}
                                <div className={cn(
                                    "p-3 rounded-lg max-w-xs",
                                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                )}>
                                    <p className="text-sm">{message.content}</p>
                                </div>
                                {message.role === 'user' && <Avatar className="bg-secondary text-secondary-foreground"><User /></Avatar>}
                            </div>
                        ))}
                         {mutation.isPending && (
                            <div className="flex items-start gap-3 justify-start">
                                <Avatar className="bg-primary text-primary-foreground"><Bot /></Avatar>
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
                        placeholder="Ask to refine your project..."
                        className="min-h-0"
                        rows={1}
                        disabled={mutation.isPending}
                    />
                    <Button type="submit" size="icon" disabled={!input.trim() || mutation.isPending}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}

// Simple Avatar component for chat
function Avatar({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", className)}>
            {children}
        </div>
    )
}
