'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Mic, MicOff, Paperclip, Send, Smile } from 'lucide-react';
import { useRef, useState } from 'react';

interface ChatInputProps {
    placeholder?: string;
    disabled?: boolean;
    isLoading?: boolean;
    onSend?: (message: string) => void;
    onAttachment?: () => void;
    onEmoji?: () => void;
    onVoiceStart?: () => void;
    onVoiceStop?: () => void;
    className?: string;
    maxLength?: number;
    showAttachments?: boolean;
    showEmoji?: boolean;
    showVoice?: boolean;
}

export function ChatInput({
    placeholder = "Type your message...",
    disabled = false,
    isLoading = false,
    onSend,
    onAttachment,
    onEmoji,
    onVoiceStart,
    onVoiceStop,
    className,
    maxLength = 1000,
    showAttachments = true,
    showEmoji = true,
    showVoice = true
}: ChatInputProps) {
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (!input.trim() || disabled || isLoading) return;

        onSend?.(input.trim());
        setInput('');

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (maxLength && value.length > maxLength) return;

        setInput(value);

        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    };

    const handleVoiceToggle = () => {
        if (isRecording) {
            setIsRecording(false);
            onVoiceStop?.();
        } else {
            setIsRecording(true);
            onVoiceStart?.();
        }
    };

    return (
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <div className={cn("relative", className)}>
                <div className="relative">
                    <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled || isLoading}
                        className={cn(
                            "w-full resize-none rounded-2xl border border-input bg-background/50 backdrop-blur-sm pr-20 py-3 shadow-soft focus:shadow-medium transition-all duration-200",
                            isRecording && "border-primary shadow-glow"
                        )}
                        rows={1}
                        maxLength={maxLength}
                    />

                    {/* Action buttons */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {showAttachments && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                                onClick={onAttachment}
                                disabled={disabled}
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>
                        )}

                        {showEmoji && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                                onClick={onEmoji}
                                disabled={disabled}
                            >
                                <Smile className="h-4 w-4" />
                            </Button>
                        )}

                        {showVoice && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-8 w-8 rounded-full transition-colors",
                                    isRecording
                                        ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                        : "hover:bg-primary/10 hover:text-primary"
                                )}
                                onClick={handleVoiceToggle}
                                disabled={disabled}
                            >
                                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            </Button>
                        )}

                        <Button
                            type="button"
                            onClick={handleSend}
                            disabled={!input.trim() || disabled || isLoading}
                            className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-600 text-primary-foreground hover:shadow-glow transition-all duration-200"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Character count */}
                {maxLength && (
                    <div className="flex justify-between items-center mt-2 px-2">
                        <div className="text-xs text-muted-foreground">
                            {isRecording && (
                                <span className="text-destructive animate-pulse">Recording...</span>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {input.length}/{maxLength}
                        </div>
                    </div>
                )}
            </div>
        </AnimatedContainer>
    );
}
