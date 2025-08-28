'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, FileText, ChevronLeft, ChevronRight, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-styles';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { A4Page } from './A4Page';
import type { AnalyzedDocument, SolvedDocument } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';

interface ContentPanelProps {
    stage: 'idle' | 'analyzing' | 'readyToSolve' | 'solving' | 'solved';
    analyzedDocument: AnalyzedDocument | null;
    solvedDocument: SolvedDocument | null;
    handleSolve: () => void;
    canSolve: boolean;
    isSolving: boolean;
    handleExportDocx: () => void;
    totalPages: number;
    currentPage: number;
    handlePrevPage: () => void;
    handleNextPage: () => void;
    isAnalyzing: boolean;
    documentType: 'exam' | 'homework' | null;
}

export function ContentPanel({
    stage,
    analyzedDocument,
    solvedDocument,
    handleSolve,
    canSolve,
    isSolving,
    handleExportDocx,
    totalPages,
    currentPage,
    handlePrevPage,
    handleNextPage,
    isAnalyzing,
    documentType,
}: ContentPanelProps) {
    const { t } = useLocalization();

    const renderContentPage = () => {
        if (currentPage === 0) {
            // Analysis Page
            return (
                <A4Page title="Analysis">
                    {stage === 'analyzing' || isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Loader2 className="h-12 w-12 animate-spin mb-4" />
                            <p>{t('builder.academicSolver.toasts.analyzingInProgress', { type: documentType })}</p>
                        </div>
                    ) : analyzedDocument ? (
                        <ReactMarkdown components={markdownComponents}>{analyzedDocument.structuredContent}</ReactMarkdown>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                            <BrainCircuit className="h-12 w-12 mb-4" />
                            <p>{t('builder.academicSolver.analysisPlaceholder')}</p>
                        </div>
                    )}
                </A4Page>
            );
        }

        // Solution Pages
        const solutionIndex = currentPage - 1;
        const solution = solvedDocument?.solutions?.[solutionIndex];
        if (!solution) return <Skeleton className="w-full h-[297mm]" />;

        return (
            <A4Page title={`Solution: Question ${solutionIndex + 1}`}>
                <div className="space-y-4">
                    <div className="border-b pb-2">
                        <ReactMarkdown components={markdownComponents}>{solution.question}</ReactMarkdown>
                    </div>
                    <div className="p-4 rounded-md bg-muted/50 border border-border">
                        <ReactMarkdown components={markdownComponents}>{solution.solution}</ReactMarkdown>
                    </div>
                </div>
            </A4Page>
        );
    };

    return (
        <Card className="min-h-[calc(100vh-250px)] flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start flex-col lg:flex-row">
                    <div>
                        <CardTitle>{analyzedDocument ? analyzedDocument.subject : t('builder.academicSolver.documentTitle')}</CardTitle>
                        <CardDescription>{analyzedDocument ? analyzedDocument.title : t('builder.academicSolver.begin')}</CardDescription>
                    </div>
                    <div className="flex gap-2 flex-col sm:flex-row mt-2 lg:mt-0">
                        {(stage === 'readyToSolve' || stage === 'solving' || stage === 'solved') && (
                            <Button onClick={handleSolve} disabled={!canSolve}>
                                {isSolving ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Wand2 className="me-2 h-4 w-4" />}
                                {t('builder.academicSolver.solveButton')}
                            </Button>
                        )}
                        {stage === 'solved' && (
                            <Button onClick={handleExportDocx}>
                                <FileText className="me-2 h-4 w-4" /> {t('builder.academicSolver.exportDocx')}
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <div className="flex-grow bg-slate-200 dark:bg-slate-900/50 p-4 rounded-b-lg">
                <ScrollArea className="h-[calc(100vh-350px)]" >
                    {renderContentPage()}
                </ScrollArea>
            </div>
            {totalPages > 1 && (
                <div className="flex justify-center items-center p-4 border-t bg-background rounded-b-lg">
                    <Button onClick={handlePrevPage} disabled={currentPage === 0} variant="ghost">
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        {t('builder.presentationGenerator.prev')}
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground">
                        Page {currentPage + 1} of {totalPages}
                    </span>
                    <Button onClick={handleNextPage} disabled={currentPage === totalPages - 1} variant="ghost">
                        {t('builder.presentationGenerator.next')}
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            )}
        </Card>
    );
}
