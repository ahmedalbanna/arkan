'use client';

import type { AnalyzedDocument, SolvedDocument } from '@/ai/schemas';
import A4Page from '@/components/shared/A4Page';
import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';
import { markdownComponents } from '@/lib/markdown-styles';
import { BrainCircuit, ChevronLeft, ChevronRight, FileText, Loader2, Wand2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
                <AnimatedContainer animation="fade-in-up" delay={200}>
                    <A4Page title="Analysis">
                        {stage === 'analyzing' || isAnalyzing ? (
                            <AnimatedContainer animation="fade-in-up" delay={300}>
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <div className="p-4 rounded-full bg-gradient-to-br from-primary to-primary-600 mb-4 shadow-soft">
                                        <Loader2 className="h-12 w-12 animate-spin text-white" />
                                    </div>
                                    <p>{t('builder.academicSolver.toasts.analyzingInProgress', { type: documentType })}</p>
                                </div>
                            </AnimatedContainer>
                        ) : analyzedDocument ? (
                            <AnimatedContainer animation="fade-in-up" delay={300}>
                                <div className="rounded-lg border bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm shadow-soft p-4">
                                    <ReactMarkdown components={markdownComponents}>{analyzedDocument.structuredContent}</ReactMarkdown>
                                </div>
                            </AnimatedContainer>
                        ) : (
                            <AnimatedContainer animation="fade-in-up" delay={300}>
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                                    <div className="p-4 rounded-full bg-gradient-to-br from-muted to-muted-foreground mb-4 shadow-soft">
                                        <BrainCircuit className="h-12 w-12 text-white" />
                                    </div>
                                    <p>{t('builder.academicSolver.analysisPlaceholder')}</p>
                                </div>
                            </AnimatedContainer>
                        )}
                    </A4Page>
                </AnimatedContainer>
            );
        }

        // Solution Pages
        const solutionIndex = currentPage - 1;
        const solution = solvedDocument?.solutions?.[solutionIndex];
        if (!solution) return <Skeleton className="w-full h-[297mm] bg-gradient-to-r from-muted to-muted/80" />;

        return (
            <AnimatedContainer animation="fade-in-up" delay={200}>
                <A4Page title={`Solution: Question ${solutionIndex + 1}`}>
                    <div className="space-y-4">
                        <AnimatedContainer animation="fade-in-up" delay={300}>
                            <div className="border-b pb-2">
                                <ReactMarkdown components={markdownComponents}>{solution.question}</ReactMarkdown>
                            </div>
                        </AnimatedContainer>
                        <AnimatedContainer animation="fade-in-up" delay={400}>
                            <div className="p-4 rounded-md bg-gradient-to-r from-muted/30 to-primary/5 backdrop-blur-sm border border-border shadow-soft hover:shadow-glow transition-all duration-200">
                                <ReactMarkdown components={markdownComponents}>{solution.solution}</ReactMarkdown>
                            </div>
                        </AnimatedContainer>
                    </div>
                </A4Page>
            </AnimatedContainer>
        );
    };

    return (
        <Card className="min-h-[calc(100vh-250px)] flex flex-col backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                <div className="flex justify-between items-start flex-col lg:flex-row">
                    <div>
                        <CardTitle className="font-headline">{analyzedDocument ? analyzedDocument.subject : t('builder.academicSolver.documentTitle')}</CardTitle>
                        <CardDescription>{analyzedDocument ? analyzedDocument.title : t('builder.academicSolver.begin')}</CardDescription>
                    </div>
                    <div className="flex gap-2 flex-col sm:flex-row mt-2 lg:mt-0">
                        {(stage === 'readyToSolve' || stage === 'solving' || stage === 'solved') && (
                            <AnimatedContainer animation="fade-in-up" delay={200}>
                                <Button
                                    onClick={handleSolve}
                                    disabled={!canSolve}
                                    variant="gradient"
                                    className="hover:shadow-glow transition-all duration-200"
                                >
                                    {isSolving ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Wand2 className="me-2 h-4 w-4" />}
                                    {t('builder.academicSolver.solveButton')}
                                </Button>
                            </AnimatedContainer>
                        )}
                        {stage === 'solved' && (
                            <AnimatedContainer animation="fade-in-up" delay={300}>
                                <Button
                                    onClick={handleExportDocx}
                                    className="hover:shadow-soft transition-all duration-200"
                                >
                                    <FileText className="me-2 h-4 w-4" /> {t('builder.academicSolver.exportDocx')}
                                </Button>
                            </AnimatedContainer>
                        )}
                    </div>
                </div>
            </CardHeader>
            <div className="flex-grow bg-gradient-to-br from-slate-200 via-slate-100 to-primary/5 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-primary/5 p-4 rounded-b-lg">
                <ScrollArea className="h-[calc(100vh-350px)]" >
                    {renderContentPage()}
                </ScrollArea>
            </div>
            {totalPages > 1 && (
                <div className="flex justify-center items-center p-4 border-t bg-gradient-to-r from-background/90 to-primary/5 backdrop-blur-sm rounded-b-lg">
                    <AnimatedContainer animation="fade-in-up" delay={400}>
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={handlePrevPage}
                                disabled={currentPage === 0}
                                variant="ghost"
                                className="hover:shadow-soft transition-all duration-200"
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                {t('builder.presentationGenerator.prev')}
                            </Button>
                            <span className="text-sm font-medium text-muted-foreground">
                                Page {currentPage + 1} of {totalPages}
                            </span>
                            <Button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages - 1}
                                variant="ghost"
                                className="hover:shadow-soft transition-all duration-200"
                            >
                                {t('builder.presentationGenerator.next')}
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </AnimatedContainer>
                </div>
            )}
        </Card>
    );
}
