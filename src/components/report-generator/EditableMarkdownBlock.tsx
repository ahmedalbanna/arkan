
'use client';

import { useState, useEffect, useRef } from 'react';
import { type Token } from 'marked';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Wand2, BookText, Maximize, PenLine, SpellCheck, Loader2, X, Check } from 'lucide-react';
import { manipulateText } from '@/ai/flows/manipulate-text';
import { useToast } from '@/hooks/use-toast';
import { markdownComponents } from '@/lib/markdown-components';

export const EditableMarkdownBlock = ({ block, onUpdate }: { block: Token, onUpdate: (newRaw: string) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(block.raw);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [isAiPopoverOpen, setIsAiPopoverOpen] = useState(false);
    const [isProcessingAi, setIsProcessingAi] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!isEditing && aiSuggestion === null) {
            setContent(block.raw);
        }
    }, [block.raw, isEditing, aiSuggestion]);

    const handleSave = () => {
        onUpdate(content);
        setIsEditing(false);
    };
    
    useEffect(() => {
        if (isEditing && textAreaRef.current) {
            textAreaRef.current.style.height = "auto";
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
    }, [isEditing, content]);

    const handleAiAction = async (command: string) => {
        setIsProcessingAi(true);
        setAiSuggestion(null);
        try {
            const result = await manipulateText({
                textToManipulate: content,
                command: command,
            });
            setAiSuggestion(result.rewrittenText);
        } catch (error) {
            console.error("AI action failed:", error);
            toast({
                title: "AI Action Failed",
                description: "Could not modify the text. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsProcessingAi(false);
            setIsAiPopoverOpen(false);
        }
    };

    const handleAcceptSuggestion = () => {
        if (aiSuggestion !== null) {
            onUpdate(aiSuggestion);
        }
        setAiSuggestion(null);
    };

    const handleRejectSuggestion = () => {
        setAiSuggestion(null);
    };


    if (aiSuggestion !== null) {
        return (
            <div className="p-2 -m-2 rounded-md border-2 border-dashed border-accent bg-accent/10 my-2">
                <p className="text-xs font-semibold text-accent-foreground mb-2">AI SUGGESTION</p>
                <div className="p-2 rounded bg-background max-h-60 overflow-y-auto">
                    <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{aiSuggestion}</ReactMarkdown>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                    <Button variant="ghost" size="sm" onClick={handleRejectSuggestion}>
                        <X className="mr-2 h-4 w-4" />
                        Reject
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleAcceptSuggestion}>
                        <Check className="mr-2 h-4 w-4" />
                        Accept
                    </Button>
                </div>
            </div>
        );
    }

    if (isEditing) {
        return (
            <Textarea
                ref={textAreaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onBlur={handleSave}
                autoFocus
                className="bg-background/80 cursor-text my-2 w-full p-2"
            />
        );
    }

    return (
        <div 
            onDoubleClick={() => setIsEditing(true)} 
            className="group relative cursor-pointer hover:bg-muted/50 rounded-md -m-2 p-2"
        >
            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{block.raw}</ReactMarkdown>
             <Popover open={isAiPopoverOpen} onOpenChange={setIsAiPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                        title="AI Actions"
                    >
                        <Wand2 className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2">
                    {isProcessingAi ? (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid gap-1">
                            <Button variant="ghost" className="justify-start" onClick={() => handleAiAction('Summarize this text concisely.')}>
                                <BookText className="mr-2 h-4 w-4" /> Summarize
                            </Button>
                            <Button variant="ghost" className="justify-start" onClick={() => handleAiAction('Expand on this topic, adding more detail.')}>
                                <Maximize className="mr-2 h-4 w-4" /> Expand
                            </Button>
                            <Button variant="ghost" className="justify-start" onClick={() => handleAiAction('Rewrite this to sound more professional.')}>
                                <PenLine className="mr-2 h-4 w-4" /> Rewrite
                            </Button>
                            <Button variant="ghost" className="justify-start" onClick={() => handleAiAction('Correct any grammar and spelling mistakes in this text. Do not change the meaning or style.')}>
                                <SpellCheck className="mr-2 h-4 w-4" /> Check Grammar
                            </Button>
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        </div>
    );
};
