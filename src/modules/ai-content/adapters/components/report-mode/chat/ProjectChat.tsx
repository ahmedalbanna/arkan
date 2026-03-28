
'use client';

import { CornerDownLeft, Loader2, MessageSquare, Sparkles, X } from "lucide-react";
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
        <div className="flex flex-col h-full bg-background/50 animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="flex items-center justify-between pb-4 border-b border-border/40 lg:border-0 lg:pb-2 group/header">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-primary/20 rounded-full blur animate-pulse opacity-0 group-hover/header:opacity-100 transition duration-500" />
                        <div className="relative p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                            <MessageSquare className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="space-y-0.5">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Project Consultant</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Neural Engine Online</p>
                        </div>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden rounded-xl" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </header>

            <div className="flex-1 overflow-hidden relative min-h-0 py-6">
                <ScrollArea className="h-full px-1" ref={scrollAreaRef}>
                    <div className="space-y-6">
                        {messages.length === 0 && (
                            <div className="text-center py-12 px-6 relative group/empty">
                                <div className="absolute inset-0 bg-radial-gradient from-primary/5 to-transparent opacity-0 group-hover/empty:opacity-100 transition-opacity duration-1000" />
                                <Avatar className="h-16 w-16 mx-auto mb-6 rounded-2xl border border-primary/20 shadow-xl shadow-primary/5 bg-primary/5 p-3">
                                    <AvatarFallback className="bg-transparent text-primary text-2xl">🤖</AvatarFallback>
                                </Avatar>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-2">Cognitive Link Established</h4>
                                <p className="text-[10px] text-muted-foreground italic leading-relaxed font-medium">
                                    Ready to synthesize improvements, suggest architectural changes, or brainstorm content vectors.
                                </p>
                            </div>
                        )}
                        {messages.map((message, index) => (
                            <div key={index} className={cn("flex items-start gap-4", message.role === 'user' ? 'flex-row-reverse' : '')}>
                                {(message.role === 'assistant') && (
                                    <div className="h-8 w-8 shrink-0 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs shadow-sm">
                                        🤖
                                    </div>
                                )}
                                 <div className={cn(
                                     "prose prose-sm max-w-[88%] p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border transition-all duration-300",
                                     (message.role === 'assistant')
                                        ? 'bg-background/60 backdrop-blur-xl border-primary/10 rounded-tl-none font-serif italic leading-relaxed text-muted-foreground hover:text-foreground'
                                        : 'bg-primary text-primary-foreground border-primary/20 rounded-tr-none font-sans font-medium shadow-primary/10'
                                 )}>
                                    <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
                                </div>
                                 {message.role === 'user' && (
                                    <div className="h-8 w-8 shrink-0 rounded-xl bg-secondary border border-border flex items-center justify-center text-secondary-foreground text-[10px] font-black shadow-sm">
                                        U
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-4 animate-in fade-in duration-300">
                                <div className="h-8 w-8 shrink-0 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs animate-pulse">
                                    🤖
                                </div>
                                <div className="bg-background/60 backdrop-blur-xl border border-primary/10 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                                    <div className="flex gap-1">
                                        <div className="h-1 w-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="h-1 w-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="h-1 w-1 bg-primary rounded-full animate-bounce" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Synthesizing Response...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            <div className="pt-4 border-t border-border/40 lg:border-t-0 lg:pt-2">
                <div className="relative group/input">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl blur opacity-0 group-focus-within/input:opacity-100 transition duration-500" />
                    <Textarea
                        placeholder="Define prompt or request advice..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        className="relative pr-14 min-h-[100px] max-h-40 resize-none bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-2xl text-[11px] font-medium leading-relaxed shadow-inner transition-all p-4"
                        disabled={isLoading}
                    />
                    <Button
                        size="icon"
                        className="absolute bottom-3 right-3 h-9 w-9 rounded-xl shadow-lg shadow-primary/20 bg-primary hover:opacity-90 transition-all"
                        onClick={handleSend}
                        disabled={isLoading || !inputValue.trim()}
                    >
                        <CornerDownLeft className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-center justify-center gap-2 mt-3 opacity-40">
                    <Sparkles className="h-2.5 w-2.5 text-primary" />
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        Neural Synthesis Engine v5.0
                    </p>
                </div>
            </div>
        </div>
    );
}
