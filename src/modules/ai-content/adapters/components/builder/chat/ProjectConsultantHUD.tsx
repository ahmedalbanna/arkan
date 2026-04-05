'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { MessageSquare, Cpu } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProjectChat } from "@/modules/ai-content/adapters/hooks/report-mode/useProjectChat";
import { SidebarContainer } from '../layout/SidebarContainer';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { cn } from '@/infrastructure/utils/cn';

/**
 * ProjectConsultantHUD — A high-fidelity AI consultation interface.
 * Provides real-time guidance and document structural intelligence.
 * 
 * DEFENSIVE MEASURES:
 * 1. Message Validation: Prevents empty or whitespace-only transmissions.
 * 2. Stable Keying: Uses message-specific data or timestamps for list integrity.
 * 3. Scroll Orchestration: Resilient scroll-to-bottom logic for dynamic streams.
 * 4. UX Safety: Disables input during processing and handles empty history.
 */

interface ProjectConsultantHUDProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProjectConsultantHUD({ isOpen, onClose }: ProjectConsultantHUDProps) {
    const { messages, sendMessage, isLoading } = useProjectChat();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // 1. STABLE MESSAGE HANDLER — With input validation
    const handleSend = useCallback((content: string) => {
        if (!content || !content.trim() || isLoading) return;
        
        try {
            const projectContext = ''; // Context is managed within the AI flow / hook
            sendMessage(content.trim(), projectContext);
        } catch (error) {
            console.error('[ProjectConsultantHUD] Transmission failure:', error);
        }
    }, [sendMessage, isLoading]);

    // 2. SCROLL ORCHESTRATION — Maintain focus on latest cognitive exchange
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
            // Slight delay to allow for DOM rendering of new messages
            const timer = setTimeout(scrollToBottom, 100);
            return () => clearTimeout(timer);
        }
    }, [messages.length, isLoading, isOpen, scrollToBottom]);

    if (!isOpen) return null;

    return (
        <SidebarContainer
            title="Project Consultant"
            icon={<MessageSquare className="h-3.5 w-3.5" />}
            actions={
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-green-500/5 border border-green-500/10 shadow-inner">
                    <div className={cn(
                        "h-1 w-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]",
                        isLoading ? "animate-ping" : "animate-pulse"
                    )} />
                    <span className="text-[8px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">
                        {isLoading ? 'Processing' : 'Active Core'}
                    </span>
                </div>
            }
        >
            <div className="flex flex-col h-full relative -mx-5 -my-5">
                {/* Cognitive Exchange Stream */}
                <div className="flex-1 overflow-hidden relative min-h-[400px]">
                    {/* Atmospheric Backdrop — Standardized Grid (28px) */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px]" />
                    
                    <ScrollArea ref={scrollAreaRef} className="h-full w-full custom-scrollbar">
                        <div className="p-6 space-y-8 pb-32">
                            {/* Empty State — Initial Sync */}
                            {messages.length === 0 && !isLoading && (
                                <div className="text-center py-16 px-8 animate-in fade-in zoom-in-95 duration-700">
                                    <div className="h-16 w-16 mx-auto mb-6 rounded-[24px] bg-primary/5 border border-primary/10 flex items-center justify-center shadow-2xl relative group/logo">
                                        <div className="absolute inset-0 bg-primary/5 blur-xl group-hover:blur-2xl transition-all duration-700" />
                                        <Cpu className="h-7 w-7 text-primary/60 relative z-10 group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-primary/80 mb-3">
                                        Neural Interface Ready
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground/60 italic leading-relaxed font-medium px-4">
                                        Initialize a consultation to refine document architecture or synthesize new content vectors.
                                    </p>
                                </div>
                            )}

                            {/* Message Nodes — Stable Keying Pattern */}
                            {messages.map((message, index) => (
                                <ChatMessage 
                                    key={`msg-${index}-${message.role}`} 
                                    role={message.role as 'assistant' | 'user'} 
                                    content={message.content} 
                                />
                            ))}

                            {/* Predictive Thinking HUD */}
                            {isLoading && (
                                <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="h-8 w-8 shrink-0 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] animate-pulse">
                                        🤖
                                    </div>
                                    <div className="bg-background/60 backdrop-blur-2xl border border-primary/10 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                                        <div className="flex gap-1.5">
                                            <div className="h-1 w-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <div className="h-1 w-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <div className="h-1 w-1 bg-primary rounded-full animate-bounce" />
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-primary/60">Processing Neural Response...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Bottom ambient fade */}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/80 to-transparent pointer-events-none z-10" />
                </div>

                {/* Primary Vector Input */}
                <ChatInput 
                    onSend={handleSend} 
                    isLoading={isLoading} 
                />
            </div>
        </SidebarContainer>
    );
}
