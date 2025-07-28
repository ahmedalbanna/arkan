

'use client';

import { useState, useEffect, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Wand2, BookText, Maximize, PenLine, SpellCheck, Loader2, MoreVertical, FileDown, PenSquare, Volume2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { markdownComponents } from '@/lib/markdown-components';
import { exportSectionAsDocx } from '@/lib/docx-exporter';
import { Button } from '@/components/ui/button';
import { exportComponentAsPDF } from '@/lib/pdf-exporter';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ManipulateTextOutput, ManipulateTextInput, SectionName } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


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


export const EditableSection = ({ sectionKey, title, icon: Icon, content, onUpdate }: EditableSectionProps) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const [isAiPopoverOpen, setIsAiPopoverOpen] = useState(false);
    const [isEditorPopoverOpen, setIsEditorPopoverOpen] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [audioSrc, setAudioSrc] = useState<string | null>(null);
    const [showAudioPlayer, setShowAudioPlayer] = useState(false);
    const { toast } = useToast();
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();
    const { t } = useLocalization();
    const ttsMutation = useTextToSpeech();


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

    const isProcessingAi = manipulateMutation.isPending || ttsMutation.isPending;

    // Effect to play audio when src changes
    useEffect(() => {
        if (audioSrc && showAudioPlayer && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
        }
    }, [audioSrc, showAudioPlayer]);


    const handleAiAction = async (command: string) => {
        if (!firebaseUser) {
            toast({ title: t('builder.toasts.authError'), variant: "destructive" });
            return;
        }
        setAiSuggestion(null);
        const token = await firebaseUser.getIdToken();
        const data = { textToManipulate: content, command };
        manipulateMutation.mutate({ data, token });
    };
    
    const handleReadAloud = () => {
        if (audioSrc) {
            setShowAudioPlayer(true);
            return;
        }
        ttsMutation.mutate({ text: content }, {
            onSuccess: (data) => {
                setAudioSrc(data.audioDataUri);
                setShowAudioPlayer(true);
                toast({ title: "Reading Aloud", description: "Audio generation successful."});
            },
        });
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
    
    const { words, chars } = calculateCounts(content);

    return (
        <div className="group relative">
            {showAudioPlayer && audioSrc && (
                <div className="flex items-center gap-2 my-2 p-2 rounded-md bg-muted">
                    <audio ref={audioRef} src={audioSrc} controls className="w-full h-8" />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowAudioPlayer(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            <div ref={contentRef} className="prose dark:prose-invert max-w-none">
                 <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                    {content}
                </ReactMarkdown>
            </div>
            
             <div className="mt-4 flex items-center justify-between gap-4 text-xs text-muted-foreground">
                <div className="flex gap-4">
                    <span>{words} words</span>
                    <span>{chars} characters</span>
                </div>
                <div className="flex items-center">
                    <Button variant="ghost" size="sm" onClick={handleReadAloud} disabled={isProcessingAi || !content}>
                        {ttsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4 mr-2" />}
                        Read Aloud
                    </Button>

                    <Popover open={isAiPopoverOpen} onOpenChange={setIsAiPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                title={t('builder.editableSection.tooltips.aiActions')}
                            >
                                <Wand2 className="h-4 w-4 mr-2" /> AI Actions
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
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>
                    <Popover open={isEditorPopoverOpen} onOpenChange={setIsEditorPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                title={t('builder.editableSection.tooltips.editorOptions')}
                            >
                                <PenSquare className="h-4 w-4 mr-2" /> Editor Tools
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2">
                            <div className="grid gap-1">
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
            </div>
        </div>
    );
};
