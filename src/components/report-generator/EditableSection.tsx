
'use client';

import { useState, useEffect, useRef } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { SectionName } from '@/ai/schemas';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Wand2, BookText, Maximize, PenLine, SpellCheck, Loader2, X, Check, MoreVertical, Copy, FileText, FileDown } from 'lucide-react';
import { manipulateText } from '@/ai/flows/manipulate-text';
import { useToast } from '@/hooks/use-toast';
import { markdownComponents } from '@/lib/markdown-components';
import { exportSectionAsDocx } from '@/lib/docx-exporter';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { exportComponentAsPDF } from '@/lib/pdf-exporter';
import { Pluggable } from 'unified';


interface EditableSectionProps {
    sectionKey: SectionName;
    title: string;
    icon: React.ElementType; // Icon component for the section
    content: string; // The markdown content of the section
    onUpdate: (key: SectionName, value: string) => void;
}

// Dynamically import react-markdown and remark-gfm
// These are client-side dependencies for rendering markdown
// We disable SSR for these components
const DynamicReactMarkdown = dynamic(() => import('react-markdown'), {
    ssr: false,
    loading: () => <Loader2 className="h-6 w-6 animate-spin text-primary" />, // Simple loading indicator
});
const DynamicRemarkGfm = dynamic(() => import('remark-gfm'), { ssr: false });

export const EditableSection = ({ sectionKey, title, icon: Icon, content, onUpdate }: EditableSectionProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentContent, setCurrentContent] = useState(content);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const [isAiPopoverOpen, setIsAiPopoverOpen] = useState(false);
    const [isEditorPopoverOpen, setIsEditorPopoverOpen] = useState(false);
    const [isProcessingAi, setIsProcessingAi] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!isEditing && aiSuggestion === null) {
            setCurrentContent(content);
        }
    }, [content, isEditing, aiSuggestion]);

    useEffect(() => {
        if (isEditing && textAreaRef.current) {
            textAreaRef.current.style.height = "auto";
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
    }, [isEditing, currentContent]);

    const handleSave = () => {
        onUpdate(sectionKey, currentContent);
        setIsEditing(false);
    };

    const handleAiAction = async (command: string) => {
        setIsProcessingAi(true);
        setAiSuggestion(null);
        try {
            const result = await manipulateText({
                textToManipulate: currentContent,
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
            onUpdate(sectionKey, aiSuggestion);
        }
        setAiSuggestion(null);
    };

    const handleRejectSuggestion = () => {
        setAiSuggestion(null);
    };
    
    // Editor Actions
    const handleCopyMarkdown = () => {
        navigator.clipboard.writeText(content);
        toast({ title: 'Copied as Markdown' });
        setIsEditorPopoverOpen(false);
    };

    const handleCopyText = () => {
        const text = contentRef.current?.innerText || '';
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied as Plain Text' });
        setIsEditorPopoverOpen(false);
    };
    
    const handleExportDocx = async () => {
        await exportSectionAsDocx(title, content, 'modern');
        setIsEditorPopoverOpen(false);
    };

    const handleExportPdf = () => {
        if (contentRef.current) {
            exportComponentAsPDF(contentRef.current, `${title}.pdf`);
        }
        setIsEditorPopoverOpen(false);
    };


    const renderEditableContent = () => {
        if (aiSuggestion !== null) {
            return (
                <div className="p-2 -m-2 rounded-md border-2 border-dashed border-accent bg-accent/10 my-2">
                    <p className="text-xs font-semibold text-accent-foreground mb-2">AI SUGGESTION</p>
                    <div className="p-2 rounded bg-background max-h-60 overflow-y-auto">
                        {/* 
                         * Use the dynamically imported ReactMarkdown component
                         * and pass the dynamically imported remarkGfm plugin.
                         * Type assertion is used here to ensure correct type compatibility for the dynamically imported plugin.
                         */}
                        <DynamicReactMarkdown components={markdownComponents} remarkPlugins={[DynamicRemarkGfm as Pluggable]}>
                            {aiSuggestion}
                            </DynamicReactMarkdown>

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
                    value={currentContent}
                    onChange={(e) => setCurrentContent(e.target.value)}
                    onBlur={handleSave}
                    autoFocus
                    className="bg-background/80 cursor-text my-2 w-full p-2"
                />
            );
        }
        
        // Display the content using the dynamically imported ReactMarkdown component
        // Pass the dynamically imported remarkGfm plugin.
        // Type assertion is used here to ensure correct type compatibility for the dynamically imported plugin.
        return (
            <DynamicReactMarkdown
                components={markdownComponents}
                remarkPlugins={[DynamicRemarkGfm as Pluggable]}>
                {content}
            </DynamicReactMarkdown>);
    }

    return (
        <AccordionItem value={title} key={sectionKey} className="bg-background rounded-lg border">
            <AccordionTrigger className="font-headline text-xl p-4 hover:no-underline">
                <div className="flex items-center">
                    <Icon className="mr-2 h-5 w-5 text-primary" /> {title}
                </div>
            </AccordionTrigger>
            <AccordionContent
                onDoubleClick={() => !isEditing && setIsEditing(true)}
                className="max-w-none p-4 text-muted-foreground border-t group relative cursor-pointer"
            >
                <div className="prose dark:prose-invert max-w-none" ref={contentRef}>
                  {renderEditableContent()}
                </div>

                <div className="absolute top-1 right-1 flex items-center opacity-0 group-hover:opacity-100">
                    <Popover open={isAiPopoverOpen} onOpenChange={setIsAiPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
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
                    <Popover open={isEditorPopoverOpen} onOpenChange={setIsEditorPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                title="Editor Options"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2">
                            <div className="grid gap-1">
                                <Button variant="ghost" className="justify-start" onClick={handleCopyMarkdown}>
                                    <Copy className="mr-2 h-4 w-4" /> Copy Markdown
                                </Button>
                                <Button variant="ghost" className="justify-start" onClick={handleCopyText}>
                                    <FileText className="mr-2 h-4 w-4" /> Copy Plain Text
                                </Button>
                                <Button variant="ghost" className="justify-start" onClick={handleExportDocx}>
                                    <FileDown className="mr-2 h-4 w-4" /> Download DOCX
                                </Button>
                                <Button variant="ghost" className="justify-start" onClick={handleExportPdf}>
                                    <FileDown className="mr-2 h-4 w-4" /> Download PDF
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};
