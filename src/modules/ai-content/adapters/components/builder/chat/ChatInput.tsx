'use client';

import React, { useState } from 'react';
import { CornerDownLeft, Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/infrastructure/utils/cn';

/**
 * ChatInput — A high-fidelity message input HUD for the AI Consultant.
 * Features automated height management, tactical focus states, and atmospheric glows.
 */

interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading: boolean;
    placeholder?: string;
    className?: string;
}

export function ChatInput({ onSend, isLoading, placeholder, className }: ChatInputProps) {
    const [value, setValue] = useState('');

    const handleSend = () => {
        if (value.trim() && !isLoading) {
            onSend(value.trim());
            setValue('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={cn("p-6 pt-2 border-t border-primary/10 bg-background/40 backdrop-blur-3xl relative overflow-hidden", className)}>
            {/* Input Surface — Tactical Glow */}
            <div className="relative group/input">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-primary/5 rounded-[20px] blur opacity-0 group-focus-within/input:opacity-100 transition duration-1000" />
                
                <Textarea
                    placeholder={placeholder || "Consult with Arkan AI..."}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="relative pr-14 min-h-[90px] max-h-40 resize-none bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-[18px] text-[11px] font-medium leading-relaxed shadow-inner transition-all p-4 custom-scrollbar"
                    disabled={isLoading}
                />

                {/* Send Primary Vector */}
                <Button
                    size="icon"
                    className={cn(
                        "absolute bottom-3 right-3 h-9 w-9 rounded-xl shadow-2xl transition-all duration-500",
                        value.trim() && !isLoading 
                            ? "bg-primary text-primary-foreground shadow-primary/30 scale-100 ring-1 ring-inset ring-white/20" 
                            : "bg-muted/20 text-muted-foreground/40 scale-95 opacity-50"
                    )}
                    onClick={handleSend}
                    disabled={isLoading || !value.trim()}
                >
                    {isLoading ? (
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Send className="h-4 w-4 transition-transform group-hover/input:translate-x-0.5 group-hover/input:-translate-y-0.5" />
                    )}
                </Button>
            </div>

            {/* Tactical Identity Footer */}
            <div className="flex items-center justify-center gap-2 mt-4 opacity-40 group-hover:opacity-60 transition-opacity">
                <Sparkles className="h-2.5 w-2.5 text-primary" />
                <p className="text-[8px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                    Project Intelligence Interface · v2.1.4
                </p>
            </div>
        </div>
    );
}
