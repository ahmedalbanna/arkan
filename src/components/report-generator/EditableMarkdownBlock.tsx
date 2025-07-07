'use client';

import { useState, useEffect, useRef } from 'react';
import { type Token, marked } from 'marked';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Wand2, BookText, Maximize, PenLine, SpellCheck, Loader2 } from 'lucide-react';
import { manipulateText } from '@/ai/flows/manipulate-text';
import { useToast } from '@/hooks/use-toast';
import { markdownComponents } from '@/lib/markdown-components';

export const EditableMarkdownBlock = ({ block, onUpdate }: { block: Token, onUpdate: (newRaw: string) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(block.raw);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [isAiPopoverOpen, setIsAiPopoverOpen] = useState(false);
    const [isProcessingAi, setIsProcessingAi] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!isEditing) {
            setContent(block.raw);
        }
    }, [block.raw, isEditing]);

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
        try {
            const result = await manipulateText({
                textToManipulate: content,
                command: command,
            });
            onUpdate(result.rewrittenText);
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
            <ReactMarkdown components={markdownComponents}>{block.raw}</ReactMarkdown>
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
