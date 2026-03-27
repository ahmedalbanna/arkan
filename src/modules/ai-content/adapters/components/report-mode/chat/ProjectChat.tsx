
'use client';

import { CornerDownLeft, Loader2, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from "@/modules/ai-content/adapters/components/report-mode/markdown-styles";
import { useProjectChat } from "@/modules/ai-content/adapters/hooks/report-mode/useProjectChat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/infrastructure/utils/cn";
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
        <div className="flex flex-col h-full bg-background">
            <header className="flex items-center justify-between pb-4 border-b lg:border-0 lg:pb-2">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg font-headline">Project Consultant</h3>
                </div>
                {/* Only show close button on mobile if needed, otherwise it's handled by sidebar tabs */}
                <Button variant="ghost" size="icon" className="h-7 w-7 lg:hidden" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </header>
            
            <div className="flex-1 overflow-hidden relative min-h-0 py-4">
                <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center py-8 px-4">
                                <Avatar className="h-12 w-12 mx-auto mb-4">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xl">🤖</AvatarFallback>
                                </Avatar>
                                <h4 className="font-medium mb-1">How can I help you today?</h4>
                                <p className="text-sm text-muted-foreground italic">
                                    Ask me about your project, suggest improvements, or brainstorm new ideas for your content.
                                </p>
                            </div>
                        )}
                        {messages.map((message, index) => (
                            <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'flex-row-reverse' : '')}>
                                {(message.role === 'assistant') && (
                                    <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarFallback className="bg-primary/10 text-primary">🤖</AvatarFallback>
                                    </Avatar>
                                )}
                                 <div className={cn(
                                     "prose prose-sm dark:prose-invert max-w-[85%] p-3 rounded-2xl shadow-sm",
                                     (message.role === 'assistant') 
                                        ? 'bg-muted rounded-tl-none' 
                                        : 'bg-primary text-primary-foreground rounded-tr-none'
                                 )}>
                                    <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
                                </div>
                                 {message.role === 'user' && (
                                    <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">U</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8 shrink-0">
                                    <AvatarFallback className="bg-primary/10 text-primary">🤖</AvatarFallback>
                                </Avatar>
                                <div className="bg-muted p-3 rounded-2xl rounded-tl-none shadow-sm">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            <div className="pt-4 border-t lg:border-t-0 lg:pt-2">
                <div className="relative">
                    <Textarea 
                        placeholder="Ask for advice..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        className="pr-12 min-h-[80px] max-h-32 resize-none bg-muted/30 focus-visible:ring-1"
                        disabled={isLoading}
                    />
                    <Button 
                        size="icon" 
                        variant="ghost"
                        className="absolute bottom-2 right-2 h-8 w-8 text-primary hover:text-primary hover:bg-primary/10" 
                        onClick={handleSend}
                        disabled={isLoading || !inputValue.trim()}
                    >
                        <CornerDownLeft className="h-5 w-5" />
                    </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center italic">
                    AI can make mistakes. Check important info.
                </p>
            </div>
        </div>
    );
}
