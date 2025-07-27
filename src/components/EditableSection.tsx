
'use client';

import { useState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { SectionName } from '@/ai/schemas';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Wand2, BookText, Maximize, PenLine, SpellCheck, Loader2, X, Check, MoreVertical, Copy, FileText, FileDown, PenSquare, Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { markdownComponents } from '@/lib/markdown-components';
import { exportSectionAsDocx } from '@/lib/docx-exporter';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { exportComponentAsPDF } from '@/lib/pdf-exporter';
import { Pluggable } from 'unified';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ManipulateTextOutput, ManipulateTextInput } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { useTranslate } from '@/hooks/use-translation';

interface EditableSectionProps {
    sectionKey: SectionName;
    title: string;
    icon: React.ElementType; // Icon component for the section
    content: string; // The markdown content of the section
    onUpdate: (key: SectionName, value: string) => void;
}

// Helper to calculate word and character counts
const calculateCounts = (text: string) => {
    if (!text) return { words: 0, chars: 0 };
    const words = text.split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    return { words, chars };
};


// API call function for text manipulation
async function manipulateTextApi(variables: { data: ManipulateTextInput, token: string }): Promise<ManipulateTextOutput> {
    const response = await fetch('/api/manipulate-text', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${variables.token}`,
        },
        body: JSON.stringify(variables.data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to manipulate text');
    }
    return response.json();
}


// Dynamically import react-markdown and remark-gfm
const DynamicReactMarkdown = dynamic(() => import('react-markdown'), {
    ssr: false,
    loading: () => <Loader2 className="h-6 w-6 animate-spin text-primary" />,
});
export const EditableSection = ({ sectionKey, title, icon: Icon, content, onUpdate }: EditableSectionProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentContent, setCurrentContent] = useState(content);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const [isAiPopoverOpen, setIsAiPopoverOpen] = useState(false);
    const [isEditorPopoverOpen, setIsEditorPopoverOpen] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const { toast } = useToast();
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();
    const { t, locale } = useLocalization();
    const translateMutation = useTranslate();

    const manipulateMutation = useMutation({
        mutationFn: manipulateTextApi,
        onSuccess: (data) => {
            setAiSuggestion(data.rewrittenText);
            queryClient.invalidateQueries({ queryKey: ['user', firebaseUser?.uid] });
            toast({ title: "Suggestion Ready", description: "The AI has provided a suggestion." });
        },
        onError: (error: Error) => {
            const isCreditError = error.message.toLowerCase().includes('credit');
            toast({ 
                title: isCreditError ? t('builder.toasts.insufficientCredits') : t('builder.toasts.generationFailed'),
                description: error.message,
                variant: "destructive" 
            });
        },
        onSettled: () => {
            setIsAiPopoverOpen(false);
        }
    });

    const isProcessingAi = translateMutation.isPending || manipulateMutation.isPending;

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
        if (!firebaseUser) {
            toast({ title: t('builder.toasts.authError'), variant: "destructive" });
            return;
        }
        setAiSuggestion(null);
        const token = await firebaseUser.getIdToken();
        const data = { textToManipulate: currentContent, command };
        manipulateMutation.mutate({ data, token });
    };
    
    const handleTranslate = async () => {
        if (!firebaseUser) return;
        translateMutation.mutate({ 
            text: String(currentContent),
            targetLang: locale === 'en' ? 'ar' : 'en' 
        }, {
            onSuccess: (data) => {
                setAiSuggestion(data.translatedText);
                toast({ title: t('builder.editableSection.toasts.translateSuccess') });
            },
            onError: (error) => {
                const isCreditError = error.message.toLowerCase().includes('credit');
                toast({ 
                    title: t('builder.editableSection.toasts.translateFailed'), 
                    description: isCreditError ? t('builder.toasts.insufficientCredits') : error.message,
                    variant: 'destructive' 
                });
            },
            onSettled: () => setIsAiPopoverOpen(false),
        });
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
    
    const handleCopyMarkdown = () => {
        navigator.clipboard.writeText(content);
        toast({ title: t('builder.editableSection.toasts.copiedMd') });
        setIsEditorPopoverOpen(false);
    };

    const handleCopyText = () => {
        const text = contentRef.current?.innerText || '';
        navigator.clipboard.writeText(text);
        toast({ title: t('builder.editableSection.toasts.copiedText') });
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
                    <p className="text-xs font-semibold text-accent-foreground mb-2">{t('builder.editableSection.aiSuggestion')}</p>
                    <div className="p-2 rounded bg-background max-h-60 overflow-y-auto">
                        <DynamicReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                            {aiSuggestion}
                        </DynamicReactMarkdown>

                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                        <Button variant="ghost" size="sm" onClick={handleRejectSuggestion}>
                            <X className="mr-2 h-4 w-4" />
                            {t('builder.editableSection.reject')}
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleAcceptSuggestion}>
                            <Check className="mr-2 h-4 w-4" />
                            {t('builder.editableSection.accept')}
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
        
        return (
            <DynamicReactMarkdown
                components={markdownComponents}
                remarkPlugins={[remarkGfm]}>
                {content}
            </DynamicReactMarkdown>);
    }
    
    const { words, chars } = calculateCounts(content);

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
                
                 <div className="mt-4 flex items-center justify-end gap-4 text-xs text-muted-foreground">
                    <span>{words} words</span>
                    <span>{chars} characters</span>
                </div>


                <div className="absolute top-1 right-1 flex items-center opacity-0 group-hover:opacity-100">
                    <Popover open={isAiPopoverOpen} onOpenChange={setIsAiPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                title={t('builder.editableSection.tooltips.aiActions')}
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
                                        <BookText className="mr-2 h-4 w-4" /> {t('builder.editableSection.aiActions.summarize')}
                                    </Button>
                                    <Button variant="ghost" className="justify-start" onClick={() => handleAiAction('Expand on this topic, adding more detail.')}>
                                        <Maximize className="mr-2 h-4 w-4" /> {t('builder.editableSection.aiActions.expand')}
                                    </Button>
                                    <Button variant="ghost" className="justify-start" onClick={() => handleAiAction('Rewrite this to sound more professional.')}>
                                        <PenLine className="mr-2 h-4 w-4" /> {t('builder.editableSection.aiActions.rewrite')}
                                    </Button>
                                    <Button variant="ghost" className="justify-start" onClick={() => handleAiAction('Correct any grammar and spelling mistakes in this text. Do not change the meaning or style.')}>
                                        <SpellCheck className="mr-2 h-4 w-4" /> {t('builder.editableSection.aiActions.checkGrammar')}
                                    </Button>
                                    <Button variant="ghost" className="justify-start" onClick={handleTranslate}>
                                        <Languages className="mr-2 h-4 w-4" /> {t('builder.editableSection.aiActions.translate')}
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
                                title={t('builder.editableSection.tooltips.editorOptions')}
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2">
                            <div className="grid gap-1">
                                <Button variant="ghost" className="justify-start" onClick={handleCopyMarkdown}>
                                    <Copy className="mr-2 h-4 w-4" /> {t('builder.editableSection.editorActions.copyMd')}
                                </Button>
                                <Button variant="ghost" className="justify-start" onClick={handleCopyText}>
                                    <FileText className="mr-2 h-4 w-4" /> {t('builder.editableSection.editorActions.copyText')}
                                </Button>
                                <Button variant="ghost" className="justify-start" onClick={handleExportDocx}>
                                    <FileDown className="mr-2 h-4 w-4" /> {t('builder.editableSection.editorActions.downloadDocx')}
                                </Button>
                                <Button variant="ghost" className="justify-start" onClick={handleExportPdf}>
                                    <FileDown className="mr-2 h-4 w-4" /> {t('builder.editableSection.editorActions.downloadPdf')}
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};
