

'use client';

import React from 'react';
import { Wand2, BookText, Maximize, PenLine, SpellCheck, Loader2, FileDown, PenSquare, Volume2, X, Check, ThumbsDown, Languages, ArrowRightLeft, MoreVertical, Brush, GitCommitVertical, UserCheck, ShieldCheck } from 'lucide-react';
import { markdownComponents } from '@/lib/markdown-styles';
import { Button } from '@/components/ui/button';
import type { SectionName } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReportStore } from '@/hooks';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { DiffPart } from '@/lib/diff';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EvaluationTools } from '../evaluation/EvaluationTools';
import { useSectionLogic } from '@/hooks';
import { useTranslationViewLogic } from '@/hooks';

interface SectionProps {
    sectionKey: SectionName;
    title: string;
    icon: React.ElementType; // Icon component for the section
    content: string; // The markdown content of the section
    onUpdate: (key: SectionName, value: string) => void;
}

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

const TranslationView = ({ sectionKey, originalContent }: { sectionKey: SectionName, originalContent: string }) => {
    const { t, locale, translatedContent, translateMutation, handleTranslate } = useTranslationViewLogic(sectionKey, originalContent);

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
    const {
        audioRef,
        localContent,
        setLocalContent,
        aiSuggestion,
        diff,
        showAudioPlayer,
        setShowAudioPlayer,
        audioSrc,
        t,
        isProcessingAi,
        ttsMutation,
        handleRewriteAction,
        handleHumanizeAction,
        handleAiAction,
        handleReadAloud,
        handleAcceptSuggestion,
        handleRejectSuggestion,
        words,
        chars,
        processedContent,
    } = useSectionLogic(sectionKey, content, onUpdate);

    return (
        <Tabs defaultValue="view">
            <div className="flex justify-between items-center mb-2">
                <TabsList>
                    <TabsTrigger value="view">{t('builder.Section.viewEditTab')}</TabsTrigger>
                    <TabsTrigger value="translate">{t('builder.Section.translateTab')}</TabsTrigger>
                    <TabsTrigger value="evaluation">{t('builder.Section.evaluationTab')}</TabsTrigger>
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
                    <ScrollArea className="h-[calc(70vh)] rounded-md border p-4">
                        <div className="prose dark:prose-invert max-w-none">
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
            <TabsContent value="evaluation">
                <EvaluationTools />
            </TabsContent>
        </Tabs>
    );
};
