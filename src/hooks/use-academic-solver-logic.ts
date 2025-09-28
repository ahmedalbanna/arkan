
'use client';

import { AcademicDocumentType } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { createAcademicSolverToolHook } from '@/core';
import { useAnalyzeAcademicDocument, useBuilderStore, useSolveAcademicDocument, useToast } from '@/hooks';
import { exportDocumentAsDocx } from '@/lib/academic-exporter';
import { useEffect, useState } from 'react';
import { z } from 'zod';

export interface ExternalContext {
    fileName: string;
    content: string;
    type: 'question' | 'context';
}

export type ContextFileType = 'question' | 'context';


export function useAcademicSolverLogic() {
    const { t, locale } = useLocalization();
    const { toast } = useToast();
    const { firebaseUser, userProfile } = useAuth();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

    const { project, updateProject } = useBuilderStore();
    const academicSolverState = project?.academicSolver;

    const [currentPage, setCurrentPage] = useState(0);

    const analyzeMutation = useAnalyzeAcademicDocument();
    const solveMutation = useSolveAcademicDocument();

    // استخدام النظام الجديد من src/core
    const academicSolverTool = createAcademicSolverToolHook({
        toolName: 'academic-solver',
        apiEndpoint: '/api/academic-solver/solve',
        schema: z.object({
            question: z.string().min(10),
            subject: z.string().min(2),
            difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
            context: z.string().optional()
        }),
        defaultValues: { question: '', subject: '', difficulty: 'medium', context: '' },
        solverType: 'general',
        successMessage: t('academicSolver.success') || 'Academic problem solved successfully!',
        errorMessage: t('academicSolver.error') || 'Failed to solve academic problem',
        customFeatures: {
            formatOutput: (data: any) => {
                return {
                    question: data.question || '',
                    answer: data.answer || '',
                    solution: data.solution || '',
                    steps: data.steps || [],
                    explanation: data.explanation || '',
                    metadata: {
                        subject: data.subject || 'General',
                        difficulty: data.difficulty || 'medium',
                        timeEstimate: data.timeEstimate || 30,
                        concepts: data.concepts || []
                    }
                };
            },
            validateInput: (data: any) => {
                return data.question && data.question.length >= 10 && data.subject && data.subject.length >= 2;
            },
            getSolutionSteps: (data: any) => data.steps || [],
            getAnswer: (data: any) => data.answer || '',
            getExplanation: (data: any) => data.explanation || '',
            getRelatedProblems: (data: any) => data.relatedProblems || []
        }
    })();

    useEffect(() => {
        setCurrentPage(0);
    }, [academicSolverState?.analyzedDocument, academicSolverState?.solvedDocument]);

    const creditCostAnalyze = 1;
    const creditCostSolve = academicSolverState?.analyzedDocument?.documentType === 'exam' ? 3 : 2;

    const handleAnalyze = async () => {
        if (!academicSolverState?.questionDocuments || academicSolverState.questionDocuments.length === 0 || !academicSolverState.documentType || !firebaseUser) {
            toast({ title: t('builder.academicSolver.toasts.analysisError'), description: t('builder.academicSolver.toasts.analysisErrorDesc'), variant: 'destructive' });
            return;
        }

        updateProject(p => p.setAcademicSolverStage('analyzing'));

        const combinedQuestionContent = academicSolverState.questionDocuments.map((doc: { fileName: string; content: string }) => `--- Content from: ${doc.fileName} ---\n${doc.content}`).join('\n\n');

        analyzeMutation.mutate({ markdown: combinedQuestionContent, documentType: academicSolverState.documentType }, {
            onSuccess: (data) => {
                updateProject(p => p.setAcademicSolverAnalyzedDocument(data));
                toast({ title: t('builder.academicSolver.toasts.analysisSuccess') });
            },
            onError: (error: any) => {
                updateProject(p => p.setAcademicSolverStage('idle'));
                toast({ title: t('builder.toasts.errorTitle'), description: error.message, variant: 'destructive' });
            }
        });
    };

    const handleSolve = async () => {
        if (!academicSolverState?.analyzedDocument || !firebaseUser) {
            toast({ title: t('builder.academicSolver.toasts.analysisMissing'), variant: 'destructive' });
            return;
        }
        updateProject(p => p.setAcademicSolverStage('solving'));

        let contextMarkdown: string | undefined = undefined;
        if (academicSolverState.externalContext && academicSolverState.externalContext.length > 0) {
            contextMarkdown = academicSolverState.externalContext.map((c: { fileName: string; content: string }) => `--- Content from: ${c.fileName} ---\n${c.content}`).join('\n\n');
        }

        solveMutation.mutate({ analyzedDocument: academicSolverState.analyzedDocument, contextMarkdown }, {
            onSuccess: (data) => {
                updateProject(p => p.setAcademicSolverSolvedDocument(data));
                toast({ title: t('builder.academicSolver.toasts.solvingSuccess') });
            },
            onError: (error: any) => {
                updateProject(p => p.setAcademicSolverStage('readyToSolve'));
                toast({ title: t('builder.toasts.errorTitle'), description: error.message, variant: 'destructive' });
            }
        });
    };

    const handleExportDocx = () => {
        if (academicSolverState?.analyzedDocument && academicSolverState?.solvedDocument) {
            exportDocumentAsDocx(academicSolverState.analyzedDocument, academicSolverState.solvedDocument);
        }
    }

    const isProcessing = analyzeMutation.isPending || solveMutation.isPending;
    const canAnalyze = (academicSolverState?.questionDocuments?.length || 0) > 0 && !!academicSolverState?.documentType && !isProcessing && (userProfile?.credits ?? 0) >= creditCostAnalyze;
    const canSolve = academicSolverState?.stage === 'readyToSolve' && !isProcessing && (userProfile?.credits ?? 0) >= creditCostSolve;

    const totalPages = 1 + (academicSolverState?.solvedDocument?.solutions?.length || 0);

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    return {
        t,
        locale,
        isPanelCollapsed,
        setIsPanelCollapsed,
        stage: academicSolverState?.stage || 'idle',
        documentType: academicSolverState?.documentType || null,
        analyzedDocument: academicSolverState?.analyzedDocument || null,
        solvedDocument: academicSolverState?.solvedDocument || null,
        questionDocuments: academicSolverState?.questionDocuments || [],
        externalContext: academicSolverState?.externalContext || [],
        setDocumentType: (newType: AcademicDocumentType | null) => updateProject(p => p.setAcademicSolverDocumentType(newType)),
        addQuestionDocument: (fileName: string, content: string) => updateProject(p => p.addAcademicSolverQuestionDocument(fileName, content)),
        removeQuestionDocument: (index: number) => updateProject(p => p.removeAcademicSolverQuestionDocument(index)),
        addExternalContext: (fileName: string, content: string) => updateProject(p => p.addAcademicSolverExternalContext(fileName, content)),
        removeExternalContext: (index: number) => updateProject(p => p.removeAcademicSolverExternalContext(index)),
        resetCurrent: () => updateProject(p => p.resetAcademicSolver()),
        currentPage,
        analyzeMutation,
        solveMutation,
        handleAnalyze,
        handleSolve,
        handleExportDocx,
        isProcessing,
        canAnalyze,
        canSolve,
        totalPages,
        handleNextPage,
        handlePrevPage,

        // النظام الجديد من src/core
        academicSolverTool,
        isProcessing: academicSolverTool.isProcessing || isProcessing,
        processedText: academicSolverTool.processedText,
        solution: academicSolverTool.solution,
        isCopied: academicSolverTool.isCopied,
        handleCopy: academicSolverTool.copyToClipboard,
        onSubmit: academicSolverTool.onSubmit,
        reset: academicSolverTool.reset,
        getSolutionSteps: academicSolverTool.getSolutionSteps,
        getAnswer: academicSolverTool.getAnswer,
        getExplanation: academicSolverTool.getExplanation,
        getRelatedProblems: academicSolverTool.getRelatedProblems,
    };
}
