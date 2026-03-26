
'use client';

import { CornerDownLeft, Loader2, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from "@/lib/utils/markdown-styles";
import { useProjectChat } from "@/modules/ai-content/adapters/hooks/report-mode/useProjectChat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import { useState, useRef, useEffect } from "react";

interface ProjectChatProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProjectChat({ isOpen, onClose }: ProjectChatProps) {
    const { messages, sendMessage, isLoading } = useProjectChat();
    const projectContext = ''; // Placeholder, you should pass actual context here
    const [inputValue, setInputValue] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const handleSend = () => {
        if (inputValue.trim()) {
            sendMessage(inputValue, projectContext);
            setInputValue('');
        }
    };

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages, isLoading]);
    
    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-md h-[60vh] bg-background border rounded-lg shadow-2xl flex flex-col animate-in slide-in-from-bottom-4">
            <header className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Project Consultant</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </header>
            <ScrollArea className="flex-1" ref={scrollAreaRef}>
                <div className="space-y-4 p-4">
                    {messages.map((message, index) => (
                        <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : '')}>
                            {(message.role === 'assistant') && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>🤖</AvatarFallback>
                                </Avatar>
                            )}
                             <div className={cn(
                                 "prose prose-sm dark:prose-invert max-w-[80%] p-3 rounded-lg",
                                 (message.role === 'assistant') ? 'bg-muted' : 'bg-primary text-primary-foreground'
                             )}>
                                <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
                            </div>
                             {message.role === 'user' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>You</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>🤖</AvatarFallback>
                            </Avatar>
                            <div className="bg-muted p-3 rounded-lg">
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <div className="p-4 border-t">
                <div className="relative">
                    <Textarea 
                        placeholder="Ask for advice or suggest a change..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        className="pr-20 min-h-[50px] max-h-24"
                        disabled={isLoading}
                    />
                    <Button 
                        size="sm" 
                        className="absolute bottom-2 right-2" 
                        onClick={handleSend}
                        disabled={isLoading || !inputValue.trim()}
                    >
                        <CornerDownLeft className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
