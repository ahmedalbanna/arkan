'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useAcademicSolverStore } from '@/hooks/useAcademicSolverStore';
import { useAnalyzeAcademicDocument, useSolveAcademicDocument } from '@/hooks/use-academic-solver';
import { exportDocumentAsDocx } from '@/lib/academic-exporter';

export function useAcademicSolverLogic() {
    const { t, locale } = useLocalization();
    const { toast } = useToast();
    const { firebaseUser, userProfile } = useAuth();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

    const store = useAcademicSolverStore();
    const {
        stage,
        documentType,
        analyzedDocument,
        solvedDocument,
        questionDocuments,
        externalContext,
    } = store;

    const [currentPage, setCurrentPage] = useState(0);

    const analyzeMutation = useAnalyzeAcademicDocument();
    const solveMutation = useSolveAcademicDocument();

    // Reset to first page when content changes
    useEffect(() => {
        setCurrentPage(0);
    }, [analyzedDocument, solvedDocument]);

    const creditCostAnalyze = 1;
    const creditCostSolve = analyzedDocument?.documentType === 'exam' ? 3 : 2;

    const handleAnalyze = async () => {
        if (questionDocuments.length === 0 || !documentType || !firebaseUser) {
            toast({ title: t('builder.academicSolver.toasts.analysisError'), description: t('builder.academicSolver.toasts.analysisErrorDesc'), variant: 'destructive' });
            return;
        }
        store.setStage('analyzing');

        const combinedQuestionContent = questionDocuments.map(doc => `--- Content from: ${doc.fileName} ---\n${doc.content}`).join('\n\n');

        analyzeMutation.mutate({ markdown: combinedQuestionContent, documentType }, {
            onSuccess: (data) => {
                store.setAnalyzedDocument(data);
                store.setStage('readyToSolve');
                toast({ title: t('builder.academicSolver.toasts.analysisSuccess') });
            },
            onError: (error: any) => {
                toast({ title: t('builder.toasts.errorTitle'), description: error.message, variant: 'destructive' });
                store.setStage('idle');
            }
        });
    };

    const handleSolve = async () => {
        if (!analyzedDocument || !firebaseUser) {
            toast({ title: t('builder.academicSolver.toasts.analysisMissing'), variant: 'destructive' });
            return;
        }
        store.setStage('solving');

        let contextMarkdown: string | undefined = undefined;
        if (externalContext && externalContext.length > 0) {
            contextMarkdown = externalContext.map(c => `--- Context from: ${c.fileName} ---\n${c.content}`).join('\n\n');
        }

        solveMutation.mutate({ analyzedDocument, contextMarkdown }, {
            onSuccess: (data) => {
                store.setSolvedDocument(data);
                store.setStage('solved');
                toast({ title: t('builder.academicSolver.toasts.solvingSuccess') });
            },
            onError: (error: any) => {
                toast({ title: t('builder.toasts.errorTitle'), description: error.message, variant: 'destructive' });
                store.setStage('readyToSolve');
            }
        });
    };

    const handleExportDocx = () => {
        if (analyzedDocument && solvedDocument) {
            exportDocumentAsDocx(analyzedDocument, solvedDocument);
        }
    }

    const isProcessing = analyzeMutation.isPending || solveMutation.isPending;
    const canAnalyze = questionDocuments.length > 0 && !!documentType && !isProcessing && (userProfile?.credits ?? 0) >= creditCostAnalyze;
    const canSolve = stage === 'readyToSolve' && !isProcessing && (userProfile?.credits ?? 0) >= creditCostSolve;

    const totalPages = 1 + (solvedDocument?.solutions?.length || 0);

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
        ...store,
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
    };
}
