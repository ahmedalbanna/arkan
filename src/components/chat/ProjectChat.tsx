
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { MessageSquare, Send, X, Bot, User, Loader2, PenToolIcon } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { useChatStore } from '@/hooks/useChatStore';
import { useAuth } from '@/context/AuthContext';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useReportStore } from '@/hooks/useReportStore';

// Separate API function for generating a section when a tool is called
async function generateSectionFromTool(variables: { sectionName: string, projectState: any, token: string }): Promise<any> {
    const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${variables.token}`
        },
        body: JSON.stringify({
            sectionToGenerate: variables.sectionName,
            proposal: variables.projectState.proposal,
            otherSections: variables.projectState.sections,
            otherDiagrams: variables.projectState.diagrams
        })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Tool execution failed');
    }
    return await response.json();
}

export default function ProjectChat() {
    const [isOpen, setIsOpen] = useState(false);
    const { messages, addMessage, updateLastMessage, input, setInput } = useChatStore();
    const { firebaseUser, refetchUser } = useAuth();
    const { getFullState, handleProposalUpdate } = useBuilderStore();
    const setSection = useReportStore(s => s.setSection);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [isStreaming, setIsStreaming] = useState(false);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages]);

    const generateSectionMutation = useMutation({
        mutationFn: async (sectionName: string) => {
            if (!firebaseUser) throw new Error("Not authenticated");
            const token = await firebaseUser.getIdToken();
            const projectState = getFullState();
            return generateSectionFromTool({ sectionName, projectState, token });
        },
        onSuccess: (data, sectionName) => {
            const content = Object.values(data)[0] as string;
            setSection(sectionName as any, content);
            addMessage({
                role: 'assistant',
                content: `I've finished writing the **${sectionName}** section. You can see it in the Report Generator tab.`
            });
            refetchUser();
        },
        onError: (error: Error) => {
            addMessage({ role: 'assistant', content: `Sorry, I failed to generate that section. Error: ${error.message}` });
        }
    });

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !firebaseUser) return;
        
        const userMessage = { role: 'user' as const, content: input };
        addMessage(userMessage);
        const projectState = getFullState();
        setInput('');
        setIsStreaming(true);
        addMessage({ role: 'assistant', content: '' }); // Add empty message to update

        try {
            const token = await firebaseUser.getIdToken();
            const response = await fetch('/api/project-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: input,
                    projectState,
                }),
            });

            if (!response.body) return;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let finalResponse: any = {};

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.substring(6);
                        if (jsonStr === '[DONE]') {
                            break;
                        }
                        try {
                            const parsed = JSON.parse(jsonStr);
                            if (parsed.text) {
                                updateLastMessage(parsed.text);
                            }
                            if (parsed.toolRequest) {
                                const tool = parsed.toolRequest;
                                updateLastMessage(`Thinking... Calling tool: \`${tool.name}\``, true);
                                if (tool.name === 'generateReportSection') {
                                    generateSectionMutation.mutate(tool.input.section);
                                } else if (tool.name === 'updateProposalField') {
                                    const { path, value } = tool.input;
                                    handleProposalUpdate(path, value);
                                    toast({ title: "Proposal Updated", description: `Field '${path}' was updated.` });
                                    addMessage({ role: 'assistant', content: `I've updated the '${path}' for you.` });
                                }
                            }
                            // Store the final structured response if available
                            if (parsed.finishReason) {
                                finalResponse = parsed;
                            }
                        } catch (e) {
                            console.error('Error parsing stream chunk:', e, jsonStr);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Streaming chat failed:', error);
            updateLastMessage("Sorry, I encountered an error. Please try again.", false);
        } finally {
            setIsStreaming(false);
        }
    };
    
    const isPending = isStreaming || generateSectionMutation.isPending;

    return (
      <>
        {!isOpen && (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 rounded-full h-16 w-16 shadow-lg z-50"
            >
                <MessageSquare className="h-8 w-8" />
            </Button>
        )}
        
        {isOpen && (
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
                    <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
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
                                        message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted',
                                        message.isToolResponse && 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200'
                                    )}>
                                        {message.isToolResponse ? (
                                            <div className="flex items-center gap-2 text-sm italic">
                                                <PenToolIcon className="h-4 w-4" />
                                                <p>{message.content}</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm">{message.content}</p>
                                        )}
                                    </div>
                                    {message.role === 'user' && <Avatar className="bg-secondary text-secondary-foreground"><User /></Avatar>}
                                </div>
                            ))}
                            {isPending && !messages[messages.length - 1]?.content && (
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
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            placeholder="Ask to refine your project..."
                            className="min-h-0"
                            rows={1}
                            disabled={isPending}
                        />
                        <Button type="submit" size="icon" disabled={!input.trim() || isPending}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        )}
      </>
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
