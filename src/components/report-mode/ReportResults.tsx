
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Section } from '../section/SectionView';
import type { SectionName } from '@/ai/schemas';
import { FileText, ChevronLeft, ChevronRight, Wand2, Volume2, Loader2, BookText, Maximize, SpellCheck, UserCheck, GitCommitVertical, Brush } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReportResults } from '@/hooks';
import A4Page from '@/components/shared/A4Page';
import { ReportActions } from './ReportActions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface ReportResultsProps {
  onSectionUpdate: (key: SectionName, value: string) => void;
  onTranslateAll: (targetLang: 'en' | 'ar') => void;
  isTranslatingAll: boolean;
}

export const ReportResults = ({ onSectionUpdate, onTranslateAll, isTranslatingAll }: ReportResultsProps) => {
  const {
    t,
    sections,
    currentPage,
    totalPages,
    handleNextPage,
    handlePrevPage,
    hasContent,
    currentSectionKey,
    getSectionTitle,
    getSectionIcon,
    isProcessingAi,
    handleAiAction,
    handleReadAloud,
    ttsMutation,
    words,
    chars
  } = useReportResults();

  const renderContent = () => {
    if (!hasContent) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px] mt-4">
                <div className="text-center text-muted-foreground p-8">
                    <FileText className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">{t('builder.reportGenerator.emptyStateTitle')}</h3>
                    <p>{t('builder.reportGenerator.emptyStateDesc')}</p>
                </div>
            </div>
        );
    }
    return (
        <div className="h-full p-4 gap-4 rounded-lg flex flex-col mt-4">
            <ScrollArea className="flex-grow">
                {currentSectionKey && (
                    <A4Page key={currentSectionKey} title={getSectionTitle(currentSectionKey)}>
                        <Section
                            sectionKey={currentSectionKey}
                            title={getSectionTitle(currentSectionKey)}
                            icon={getSectionIcon(currentSectionKey)}
                            content={sections[currentSectionKey]!}
                            onUpdate={onSectionUpdate}
                        />
                    </A4Page>
                )}
            </ScrollArea>
        </div>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline">{t('builder.reportGenerator.resultsTitle')}</CardTitle>
                    <CardDescription>{t('builder.reportGenerator.resultsDesc')}</CardDescription>
                </div>
                <ReportActions
                    onTranslateAll={onTranslateAll}
                    isTranslating={isTranslatingAll}
                />
            </div>
             {hasContent && (
                <div className="flex items-center justify-between pt-4 border-t mt-4">
                    <div className="flex items-center text-xs text-muted-foreground">
                        <span>{words} {t('builder.Section.words')}</span>
                        <span className="mx-2">|</span>
                        <span>{chars} {t('builder.Section.characters')}</span>
                    </div>
                    <div className="flex items-center">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span tabIndex={0}>
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
                                <DropdownMenuItem onClick={() => handleAiAction('Humanize', false)}><UserCheck className="me-2 h-4 w-4" />{t('builder.Section.aiActions.humanize')}</DropdownMenuItem>
                                <DropdownMenuItem><GitCommitVertical className="me-2 h-4 w-4" />{t('builder.Section.aiActions.versionHistory')}</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger><Brush className="me-2 h-4 w-4" />{t('builder.Section.aiActions.rewrite')}</DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuItem onClick={() => handleAiAction('Formal', false)}>{t('builder.Section.aiActions.styles.formal')}</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleAiAction('Friendly', false)}>{t('builder.Section.aiActions.styles.friendly')}</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleAiAction('Simple', false)}>{t('builder.Section.aiActions.styles.simple')}</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleAiAction('Creative', false)}>{t('builder.Section.aiActions.styles.creative')}</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleAiAction('Professional', false)}>{t('builder.Section.aiActions.styles.professional')}</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleAiAction('Academic', false)}>{t('builder.Section.aiActions.styles.academic')}</DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            )}
        </CardHeader>
        {totalPages > 1 && (
            <div className="flex w-full justify-center items-center p-2 border-b bg-background">
                <Button onClick={handlePrevPage} disabled={currentPage === 0} variant="ghost">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {t('builder.presentationGenerator.prev')}
                </Button>
                <span className="text-sm font-medium text-muted-foreground mx-4">
                    Page {currentPage + 1} of {totalPages}
                </span>
                <Button onClick={handleNextPage} disabled={currentPage === totalPages - 1} variant="ghost">
                    {t('builder.presentationGenerator.next')}
                    <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        )}
        <CardContent className="flex-grow flex flex-col p-0 bg-slate-200 dark:bg-slate-900/50">
            {renderContent()}
        </CardContent>
    </Card>
  );
};
