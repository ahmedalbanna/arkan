'use client';

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/infrastructure/utils/cn';
import { useProjectChat } from "@/modules/ai-content/adapters/hooks/report-mode/useProjectChat";
import { Check, Copy, Cpu, Download, MessageSquare, Settings2, Sparkles, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from 'react';
import { SidebarContainer } from '../layout/SidebarContainer';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';

interface ProjectConsultantHUDProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProjectConsultantHUD({ isOpen, onClose }: ProjectConsultantHUDProps) {
    const { messages, sendMessage, isLoading, clearChat, exportChat } = useProjectChat();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const handleSend = useCallback((content: string) => {
        if (!content || !content.trim() || isLoading) return;
        try {
            sendMessage(content.trim());
        } catch (error) {
            console.error('[ProjectConsultantHUD] Transmission failure:', error);
        }
    }, [sendMessage, isLoading]);

    const handleClearChat = useCallback(() => {
        if (messages.length === 0) return;
        if (window.confirm('Clear all conversation history? This cannot be undone.')) {
            clearChat();
        }
    }, [clearChat, messages.length]);

    const handleExportChat = useCallback(async () => {
        const content = exportChat();
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-export-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [exportChat]);

    const handleCopyChat = useCallback(async () => {
        const content = exportChat();
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [exportChat]);

    const scrollToBottom = useCallback(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTo({
                    top: scrollContainer.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    }, []);

    useEffect(() => {
        if (isOpen && (messages.length > 0 || isLoading)) {
            const timer = setTimeout(scrollToBottom, 100);
            return () => clearTimeout(timer);
        }
    }, [messages.length, isLoading, isOpen, scrollToBottom]);

    // Keyboard shortcuts
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + K to clear chat
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                handleClearChat();
            }
            // Ctrl/Cmd + Shift + E to export
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
                e.preventDefault();
                handleExportChat();
            }
            // Escape to close
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleClearChat, handleExportChat, onClose]);

    if (!isOpen) return null;

    return (
        <SidebarContainer
            title="Project Consultant"
            icon={<MessageSquare className="h-3.5 w-3.5" />}
            actions={
                <div className="flex items-center gap-2">
                    {/* Status Indicator */}
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-green-500/5 border border-green-500/10 shadow-inner">
                        <div className={cn(
                            "h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]",
                            isLoading ? "animate-ping" : "animate-pulse"
                        )} />
                        <span className="text-[8px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">
                            {isLoading ? 'Processing' : 'Active Core'}
                        </span>
                    </div>

                    {/* Action Buttons - Desktop */}
                    {(
                        <TooltipProvider>
                            <DropdownMenu>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 rounded-lg"
                                            >
                                                <Settings2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="text-[8px]">
                                        Chat options
                                    </TooltipContent>
                                </Tooltip>
                                <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenuItem onClick={handleExportChat} className="text-[10px]">
                                        <Download className="h-3 w-3 mr-2" />
                                        Export chat
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleCopyChat} className="text-[10px]">
                                        {copied ? (
                                            <Check className="h-3 w-3 mr-2 text-green-500" />
                                        ) : (
                                            <Copy className="h-3 w-3 mr-2" />
                                        )}
                                        Copy chat
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleClearChat} className="text-[10px] text-destructive">
                                        <Trash2 className="h-3 w-3 mr-2" />
                                        Clear history
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TooltipProvider>
                    )}
                </div>
            }
        >
            <div className="flex flex-col h-full relative -mx-5 -my-5">
                {/* Chat Header Stats - Desktop */}
                {messages.length > 0 && (
                    <div className="px-6 pt-4 pb-2 border-b border-primary/10 bg-muted/5">
                        <div className="flex items-center justify-between text-[8px] text-muted-foreground/40">
                            <div className="flex items-center gap-3">
                                <span>{messages.length} message{messages.length !== 1 ? 's' : ''}</span>
                                <span>•</span>
                                <span>AI ready to assist</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono">⌘K to clear</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages Stream */}
                <div className="flex-1 overflow-hidden relative min-h-[400px]">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px]" />

                    <ScrollArea ref={scrollAreaRef} className="h-full w-full custom-scrollbar">
                        <div className="p-5 space-y-6 pb-32">
                            {/* Empty State */}
                            {messages.length === 0 && !isLoading && (
                                <div className="text-center py-20 px-6 animate-in fade-in zoom-in-95 duration-700">
                                    <div className="h-20 w-20 mx-auto mb-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center shadow-2xl relative group/logo">
                                        <div className="absolute inset-0 bg-primary/5 blur-xl group-hover/logo:blur-2xl transition-all duration-700" />
                                        <Cpu className="h-8 w-8 text-primary/60 relative z-10 group-hover/logo:scale-110 transition-transform duration-500" />
                                    </div>
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-primary/80 mb-3">
                                        Neural Interface Ready
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground/60 leading-relaxed max-w-[280px] mx-auto">
                                        Ask me about your document structure, get writing suggestions, or request content generation.
                                    </p>
                                    {(
                                        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[8px] text-muted-foreground/40">
                                            <span className="px-2 py-1 rounded-md bg-muted/30">Try: "Summarize this section"</span>
                                            <span className="px-2 py-1 rounded-md bg-muted/30">"Suggest improvements"</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Message List */}
                            {messages.map((message, index) => (
                                <ChatMessage
                                    key={`msg-${index}-${message.role}-${message.timestamp || index}`}
                                    role={message.role as 'assistant' | 'user'}
                                    content={message.content}
                                    isStreaming={message.isStreaming}
                                />
                            ))}

                            {/* Typing Indicator */}
                            {isLoading && (
                                <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="h-8 w-8 shrink-0 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <Sparkles className="h-4 w-4 text-primary/60 animate-pulse" />
                                    </div>
                                    <div className="bg-background/80 backdrop-blur-sm border border-primary/10 p-4 rounded-2xl rounded-tl-none shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1.5">
                                                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" />
                                            </div>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-primary/60">
                                                Processing neural response...
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Bottom fade */}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/90 to-transparent pointer-events-none z-10" />
                </div>

                {/* Input Area */}
                <ChatInput
                    onSend={handleSend}
                    isLoading={isLoading}
                    placeholder={"Ask about your document..."}
                />
            </div>
        </SidebarContainer>
    );
}
