

'use client';

import { useState, useEffect, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Wand2, BookText, Maximize, PenLine, SpellCheck, Loader2, FileDown, PenSquare, Volume2, X, Check, ThumbsDown, Languages, ArrowRightLeft, MoreVertical, Brush, GitCommitVertical, UserCheck } from 'lucide-react';
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
import { Textarea } from '../ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { useRewriteText, useHumanizeText } from '@/hooks/use-writing-tools';
import { computeDiff, DiffPart } from '@/lib/diff';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { processPlantUml } from '@/lib/utils';

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

const DiffView = ({ diff }: { diff: DiffPart[] }) => {
    return (
        <p className="whitespace-pre-wrap">
            {diff.map((part, index) => (
                <span key={index} className={cn({
                    'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300': part.type === 'added',
                    'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 line-through': part.type === 'removed',
                })}>
                    {part.value}
                </span>
            ))}
        </p>
    )
}

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
        const targetLang = locale === 'en' ? 'ar' : 'en';
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
                    <h4 className="font-semibold text-sm">{t('builder.Section.originalLabel')} ({locale === 'en' ? 'English' : 'Arabic'})</h4>
                    <Card className="h-64">
                        <ScrollArea className="h-full">
                            <div className="p-4 prose dark:prose-invert max-w-none text-sm">
                                <ReactMarkdown components={markdownComponents}>{originalContent}</ReactMarkdown>
                            </div>
                        </ScrollArea>
                    </Card>
                </div>
                <div className="space-y-2">
                     <h4 className="font-semibold text-sm">{t('builder.Section.translationLabel')} ({locale === 'en' ? 'Arabic' : 'English'})</h4>
                    <Card className="h-64">
                        <ScrollArea className="h-full">
                            <div className="p-4 prose dark:prose-invert max-w-none text-sm">
                               {translateMutation.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
                               {!translateMutation.isPending && translatedContent && <ReactMarkdown components={markdownComponents}>{translatedContent}</ReactMarkdown>}
                               {!translateMutation.isPending && !translatedContent && <p className="text-xs text-muted-foreground">{t('builder.Section.translatePlaceholder')}</p>}
                            </div>
                        </ScrollArea>
                    </Card>
                </div>
            </div>
             <Button onClick={handleTranslate} disabled={translateMutation.isPending}>
                {translateMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <ArrowRightLeft className="me-2 h-4 w-4" />}
                {t('builder.Section.translateButton')}
            </Button>
        </div>
    )
}

export const Section = ({ sectionKey, title, icon: Icon, content, onUpdate }: SectionProps) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [localContent, setLocalContent] = useState(content);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [diff, setDiff] = useState<DiffPart[] | null>(null);
    const [showAudioPlayer, setShowAudioPlayer] = useState(false);
    const [audioSrc, setAudioSrc] = useState<string | null>(null);
    const { toast } = useToast();
    const { firebaseUser, refetchUser } = useAuth();
    const { t } = useLocalization();
    const ttsMutation = useTextToSpeech();
    const rewriteMutation = useRewriteText();
    const humanizeMutation = useHumanizeText();

    useEffect(() => {
        setLocalContent(content);
    }, [content])


    const manipulateMutation = useMutation({
        mutationFn: manipulateTextApi,
        onSuccess: (data) => {
            setAiSuggestion(data.rewrittenText);
            setDiff(computeDiff(content, data.rewrittenText));
            refetchUser();
            toast({ title: t('builder.Section.toasts.suggestionReadyTitle'), description: t('builder.Section.toasts.suggestionReadyDesc') });
        },
        onError: (error: Error) => {
            const isCreditError = error.message.toLowerCase().includes('credit');
            toast({
                title: isCreditError ? t('builder.toasts.insufficientCredits') : t('builder.toasts.generationFailed'),
                description: error.message,
                variant: "destructive"
            });
        },
    });

    const handleRewriteAction = (style: string) => {
        setAiSuggestion(null);
        setDiff(null);
        rewriteMutation.mutate({ text: content, style }, {
            onSuccess: (data) => {
                setAiSuggestion(data.rewrittenText);
                setDiff(computeDiff(content, data.rewrittenText));
                refetchUser();
            },
            onError: (error) => toast({ title: t('builder.Section.toasts.rewriteFailed'), description: error.message, variant: "destructive"})
        });
    }

    const handleHumanizeAction = () => {
        setAiSuggestion(null);
        setDiff(null);
        humanizeMutation.mutate({ text: content }, {
            onSuccess: (data) => {
                setAiSuggestion(data.humanizedText);
                setDiff(computeDiff(content, data.humanizedText));
                refetchUser();
            },
            onError: (error) => toast({ title: t('builder.Section.toasts.humanizeFailed'), description: error.message, variant: "destructive"})
        });
    }

    const isProcessingAi = manipulateMutation.isPending || ttsMutation.isPending || rewriteMutation.isPending || humanizeMutation.isPending;

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
        setDiff(null);
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
                toast({ title: t('builder.Section.toasts.ttsSuccessTitle'), description: t('builder.Section.toasts.ttsSuccessDesc')});
            },
        });
    };

    const handleAcceptSuggestion = () => {
        if (aiSuggestion !== null) {
            onUpdate(sectionKey, aiSuggestion);
            setAiSuggestion(null);
            setDiff(null);
        }
    };

    const handleRejectSuggestion = () => {
        setAiSuggestion(null);
        setDiff(null);
    };

    const { words, chars } = calculateCounts(content);
    const processedContent = processPlantUml(content);

    return (
        <Tabs defaultValue="view">
            <div className="flex justify-between items-center mb-2">
                <TabsList>
                    <TabsTrigger value="view">{t('builder.Section.viewTab')}</TabsTrigger>
                    <TabsTrigger value="edit">{t('builder.Section.editTab')}</TabsTrigger>
                    <TabsTrigger value="translate">{t('builder.Section.translateTab')}</TabsTrigger>
                </TabsList>
                 <div className="flex items-center text-xs text-muted-foreground">
                    <span>{words} {t('builder.Section.words')}</span>
                    <span className="mx-2">|</span>
                    <span>{chars} {t('builder.Section.characters')}</span>
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
                    <ScrollArea className="h-full max-h-[60vh] rounded-md border">
                        <div className="prose dark:prose-invert max-w-none p-4">
                            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{processedContent}</ReactMarkdown>
                        </div>
                    </ScrollArea>

                    {aiSuggestion && (
                         <Card className="mt-4 border-accent">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                <Wand2 className="h-5 w-5 text-accent" /> {t('builder.Section.aiSuggestion')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="prose dark:prose-invert max-w-none text-sm p-4 bg-muted/50 rounded-md max-h-60 overflow-y-auto">
                               {diff ? (
                                   <DiffView diff={diff} />
                               ) : (
                                   <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                                        {aiSuggestion}
                                    </ReactMarkdown>
                               )}
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 pt-4">
                                <Button variant="ghost" onClick={handleRejectSuggestion}>
                                    <ThumbsDown className="me-2 h-4 w-4" /> {t('builder.Section.reject')}
                                </Button>
                                <Button onClick={handleAcceptSuggestion}>
                                    <Check className="me-2 h-4 w-4" /> {t('builder.Section.accept')}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                     <div className="flex items-center justify-end">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span tabIndex={0}> {/* Wrapper for disabled button */}
                                        <Button variant="ghost" size="sm" onClick={handleReadAloud} disabled={ttsMutation.isPending}>
                                            {ttsMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Volume2 className="h-4 w-4 mr-2" />}
                                            {t('builder.Section.readAloud')}
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('builder.Section.tooltips.readAloud')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" disabled={isProcessingAi}>
                                    {isProcessingAi ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />} {t('builder.Section.aiActions.title')}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleAiAction(t('builder.Section.aiActions.summarizePrompt'))}><BookText className="me-2 h-4 w-4" />{t('builder.Section.aiActions.summarize')}</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAiAction(t('builder.Section.aiActions.expandPrompt'))}><Maximize className="me-2 h-4 w-4" />{t('builder.Section.aiActions.expand')}</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAiAction(t('builder.Section.aiActions.checkGrammarPrompt'))}><SpellCheck className="me-2 h-4 w-4" />{t('builder.Section.aiActions.checkGrammar')}</DropdownMenuItem>
                                <DropdownMenuItem onClick={handleHumanizeAction}><UserCheck className="me-2 h-4 w-4" />{t('builder.Section.aiActions.humanize')}</DropdownMenuItem>
                                <DropdownMenuItem><GitCommitVertical className="me-2 h-4 w-4" />{t('builder.Section.aiActions.versionHistory')}</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger><Brush className="me-2 h-4 w-4" />{t('builder.Section.aiActions.rewrite')}</DropdownMenuSubTrigger>
                                     <DropdownMenuSubContent>
                                        <DropdownMenuItem onClick={() => handleRewriteAction('Formal')}>{t('builder.Section.aiActions.styles.formal')}</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleRewriteAction('Friendly')}>{t('builder.Section.aiActions.styles.friendly')}</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleRewriteAction('Simple')}>{t('builder.Section.aiActions.styles.simple')}</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleRewriteAction('Creative')}>{t('builder.Section.aiActions.styles.creative')}</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleRewriteAction('Professional')}>{t('builder.Section.aiActions.styles.professional')}</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleRewriteAction('Academic')}>{t('builder.Section.aiActions.styles.academic')}</DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                            </DropdownMenuContent>
                         </DropdownMenu>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="edit">
                <Textarea
                    value={localContent}
                    onChange={(e) => setLocalContent(e.target.value)}
                    onBlur={() => onUpdate(sectionKey, localContent)}
                    className="h-[50vh] min-h-[300px]"
                />
            </TabsContent>
            <TabsContent value="translate">
                <TranslationView sectionKey={sectionKey} originalContent={content} />
            </TabsContent>
        </Tabs>
    );
};
