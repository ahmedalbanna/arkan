
'use client';

import { useState, useEffect, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Wand2, BookText, Maximize, PenLine, SpellCheck, Loader2, FileDown, PenSquare, Volume2, X, Check, ThumbsDown, Languages, ArrowRightLeft } from 'lucide-react';
import { toast, useToast } from '@/hooks/use-toast';
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { useTranslate } from '@/hooks/use-translation';
import { useReportStore } from '@/hooks/useReportStore';

// BlockNote Imports
import { BlockNoteViewRaw, useCreateBlockNote } from "@blocknote/react";

interface SectionProps {
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

const TranslationView = ({ sectionKey, originalContent }: { sectionKey: SectionName, originalContent: string }) => {
    const { t, locale } = useLocalization();
    const { translatedSections, setTranslatedSection } = useReportStore();
    const translateMutation = useTranslate();
    const translatedContent = translatedSections[sectionKey];

    const handleTranslate = async () => {
        const targetLang = locale === 'en' ? 'Arabic' : 'English';
        translateMutation.mutate({ text: originalContent, targetLang }, {
            onSuccess: (data) => {
                setTranslatedSection(sectionKey, data.translatedText);
                toast({ title: t('builder.Section.toasts.translateSuccess') });
            },
            onError: (error) => {
                const isCreditError = error.message.toLowerCase().includes('credit');
                toast({ 
                    title: t('builder.Section.toasts.translateFailed'), 
                    description: isCreditError ? t('builder.toasts.insufficientCredits') : error.message,
                    variant: 'destructive' 
                });
            }
        });
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Original ({locale === 'en' ? 'English' : 'Arabic'})</h4>
                    <Card className="h-64">
                        <ScrollArea className="h-full">
                            <div className="p-4 prose dark:prose-invert max-w-none text-sm">
                                <ReactMarkdown components={markdownComponents}>{originalContent}</ReactMarkdown>
                            </div>
                        </ScrollArea>
                    </Card>
                </div>
                <div className="space-y-2">
                     <h4 className="font-semibold text-sm">Translation ({locale === 'en' ? 'Arabic' : 'English'})</h4>
                    <Card className="h-64">
                        <ScrollArea className="h-full">
                            <div className="p-4 prose dark:prose-invert max-w-none text-sm">
                               {translateMutation.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
                               {!translateMutation.isPending && translatedContent && <ReactMarkdown components={markdownComponents}>{translatedContent}</ReactMarkdown>}
                               {!translateMutation.isPending && !translatedContent && <p className="text-xs text-muted-foreground">Click translate to see the result here.</p>}
                            </div>
                        </ScrollArea>
                    </Card>
                </div>
            </div>
             <Button onClick={handleTranslate} disabled={translateMutation.isPending}>
                {translateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRightLeft className="mr-2 h-4 w-4" />}
                Translate
            </Button>
        </div>
    )
}

export const Section = ({ sectionKey, title, icon: Icon, content, onUpdate }: SectionProps) => {
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

     // Creates a new editor instance.
    const editor = useCreateBlockNote();

    // Converts the markdown from props to BlockNote's format and loads it.
    useEffect(() => {
        async function loadContent() {
            if (editor && content) {
                const blocks = await editor.tryParseMarkdownToBlocks(content);
                editor.replaceBlocks(editor.document, blocks);
            }
        }
        loadContent();
    }, [editor, content]);


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

    const handleExportPdf = async () => {
       if (editor.domElement) {
         // Temporarily hide the toolbar for a cleaner PDF
         const toolbar = editor.domElement.querySelector('.bn-floating-toolbar');
         if (toolbar) (toolbar as HTMLElement).style.display = 'none';

         await exportComponentAsPDF(editor.domElement, `${title}.pdf`);

         // Restore the toolbar
         if (toolbar) (toolbar as HTMLElement).style.display = '';
       }
       setIsEditorPopoverOpen(false);
    };

    const handleAcceptSuggestion = () => {
        if (aiSuggestion !== null) {
            onUpdate(sectionKey, aiSuggestion);
            setAiSuggestion(null);
        }
    };
    
    const handleRejectSuggestion = () => {
        setAiSuggestion(null);
    };
    
    const { words, chars } = calculateCounts(content);

    return (
        <Tabs defaultValue="view">
            <div className="flex justify-between items-center mb-2">
                <TabsList>
                    <TabsTrigger value="view">View</TabsTrigger>
                    <TabsTrigger value="translate">Translate</TabsTrigger>
                </TabsList>
                 <div className="flex items-center text-xs text-muted-foreground">
                    <span>{words} words</span>
                    <span className="mx-2">|</span>
                    <span>{chars} characters</span>
                 </div>
            </div>
            <TabsContent value="view">
                <div className="group relative space-y-4">
                    {showAudioPlayer && audioSrc && (
                        <div className="flex items-center gap-2 my-2 p-2 rounded-md bg-muted">
                            <audio ref={audioRef} src={audioSrc} controls className="w-full h-8" />
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowAudioPlayer(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                     <div className="border rounded-md">
                        <BlockNoteViewRaw
                          editor={editor}
                          theme={"light"}
                          sideMenu={false}
                          formattingToolbar={true}
                          linkToolbar={true}
                          onChange={async () => {
                            const markdown = await editor.blocksToMarkdownLossy(editor.document);
                            onUpdate(sectionKey, markdown);
                          }}
                        />
                    </div>

                    {aiSuggestion && (
                         <Card className="mt-4 border-accent">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                   <Wand2 className="h-5 w-5 text-accent" /> {t('builder.Section.aiSuggestion')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="prose dark:prose-invert max-w-none text-sm p-4 bg-muted/50 rounded-md max-h-60 overflow-y-auto">
                                <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                                    {aiSuggestion}
                                </ReactMarkdown>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 pt-4">
                                <Button variant="ghost" onClick={handleRejectSuggestion}>
                                    <ThumbsDown className="mr-2 h-4 w-4" /> {t('builder.Section.reject')}
                                </Button>
                                <Button onClick={handleAcceptSuggestion}>
                                    <Check className="mr-2 h-4 w-4" /> {t('builder.Section.accept')}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                    
                     <div className="flex items-center justify-end">
                        <Button variant="ghost" size="sm" onClick={handleReadAloud} disabled={isProcessingAi || !content}>
                            {ttsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4 mr-2" />}
                            Read Aloud
                        </Button>

                        <Popover open={isAiPopoverOpen} onOpenChange={setIsAiPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" title={t('builder.Section.tooltips.aiActions')}>
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
                                            <BookText className="mr-2 h-4 w-4" /> {t('builder.Section.aiActions.summarize')}
                                        </Button>
                                        <Button variant="ghost" className="justify-start" onClick={() => handleAiAction('Expand on this topic, adding more detail.')}>
                                            <Maximize className="mr-2 h-4 w-4" /> {t('builder.Section.aiActions.expand')}
                                        </Button>
                                        <Button variant="ghost" className="justify-start" onClick={() => handleAiAction('Rewrite this to sound more professional.')}>
                                            <PenLine className="mr-2 h-4 w-4" /> {t('builder.Section.aiActions.rewrite')}
                                        </Button>
                                        <Button variant="ghost" className="justify-start" onClick={() => handleAiAction('Correct any grammar and spelling mistakes in this text. Do not change the meaning or style.')}>
                                            <SpellCheck className="mr-2 h-4 w-4" /> {t('builder.Section.aiActions.checkGrammar')}
                                        </Button>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>
                        <Popover open={isEditorPopoverOpen} onOpenChange={setIsEditorPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" title={t('builder.Section.tooltips.editorOptions')}>
                                    <PenSquare className="h-4 w-4 mr-2" /> Editor Tools
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-2">
                                <div className="grid gap-1">
                                    <Button variant="ghost" className="justify-start" onClick={handleExportDocx}>
                                        <FileDown className="mr-2 h-4 w-4" /> {t('builder.Section.editorActions.downloadDocx')}
                                    </Button>
                                    <Button variant="ghost" className="justify-start" onClick={handleExportPdf}>
                                        <FileDown className="mr-2 h-4 w-4" /> {t('builder.Section.editorActions.downloadPdf')}
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="translate">
                <TranslationView sectionKey={sectionKey} originalContent={content} />
            </TabsContent>
        </Tabs>
    );
};
