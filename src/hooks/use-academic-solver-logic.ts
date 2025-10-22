
'use client';

import type { AcademicDocumentType } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useAnalyzeAcademicDocument, useBuilderStore, useSolveAcademicDocument, useToast } from '@/hooks';
import { exportDocumentAsDocx } from '@/lib/academic-exporter';
import { useEffect, useState } from 'react';
import { AcademicSolverManager } from '@/lib/models/academic-solver-manager';

/**
 * This hook encapsulates all the business logic for the Academic Solver feature.
 * It interacts with the global `useBuilderStore` to get project data and provides
 * memoized values and callbacks for the UI components.
 */
export function useAcademicSolverLogic() {
    const { t, locale } = useLocalization();
    const { toast } = useToast();
    const { firebaseUser, userProfile } = useAuth();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

    // Get the project and updater function from the global store.
    const project = useBuilderStore(s => s.project);
    const updateProject = useBuilderStore(s => s.updateProject);

    // If the project doesn't exist yet (e.g., loading), we can't proceed.
    // We return a fallback state to prevent the UI from crashing.
    if (!project) {
        // This fallback provides a non-null, dummy manager and default values 
        // to ensure the consuming components don't crash during initial load.
        return {
            t, locale, isPanelCollapsed, setIsPanelCollapsed, isProjectLoaded: false,
            academicSolver: new AcademicSolverManager(), // A temporary, empty manager
            stage: 'idle', documentType: null, analyzedDocument: null, solvedDocument: null,
            questionDocuments: [], externalContext: [],
            setDocumentType: () => {}, addQuestionDocument: () => {}, removeQuestionDocument: () => {},
            addExternalContext: () => {}, removeExternalContext: () => {}, resetCurrent: () => {},
            currentPage: 0, analyzeMutation: { isPending: true }, solveMutation: { isPending: true }, handleAnalyze: () => {}, handleSolve: () => {}, handleExportDocx: () => {},
            isProcessing: true, canAnalyze: false, canSolve: false, totalPages: 1, handleNextPage: () => {}, handlePrevPage: () => {}
        };
    }

    // Now that we know the project exists, we can safely access its properties.
    const academicSolver = project.academicSolver;

    const [currentPage, setCurrentPage] = useState(0);
    const analyzeMutation = useAnalyzeAcademicDocument();
    const solveMutation = useSolveAcademicDocument();

    // Reset pagination when the underlying documents change.
    useEffect(() => {
        setCurrentPage(0);
    }, [academicSolver.analyzedDocument, academicSolver.solvedDocument]);

    const creditCostAnalyze = 1;
    const creditCostSolve = academicSolver.analyzedDocument?.documentType === 'exam' ? 3 : 2;

    const handleAnalyze = async () => {
        if (!academicSolver.questionDocuments.length || !academicSolver.documentType || !firebaseUser) {
            toast({ title: t('builder.academicSolver.toasts.analysisError'), description: t('builder.academicSolver.toasts.analysisErrorDesc'), variant: 'destructive' });
            return;
        }

        updateProject(p => { p.academicSolver.setStage('analyzing'); });

        const combinedQuestionContent = academicSolver.questionDocuments
            .map(doc => `--- Content from: ${doc.fileName} ---\n${doc.content}`)
            .join('\n\n');

        analyzeMutation.mutate({ markdown: combinedQuestionContent, documentType: academicSolver.documentType }, {
            onSuccess: (data) => {
                updateProject(p => { p.academicSolver.setAnalyzedDocument(data); });
                toast({ title: t('builder.academicSolver.toasts.analysisSuccess') });
            },
            onError: (error: any) => {
                updateProject(p => { p.academicSolver.setStage('idle'); });
                toast({ title: t('builder.toasts.errorTitle'), description: error.message, variant: 'destructive' });
            }
        });
    };

    const handleSolve = async () => {
        if (!academicSolver.analyzedDocument || !firebaseUser) {
            toast({ title: t('builder.academicSolver.toasts.analysisMissing'), variant: 'destructive' });
            return;
        }
        updateProject(p => { p.academicSolver.setStage('solving'); });

        const contextMarkdown = academicSolver.externalContext.length > 0
            ? academicSolver.externalContext
                  .map(c => `--- Content from: ${c.fileName} ---\n${c.content}`)
                  .join('\n\n')
            : undefined;

        solveMutation.mutate({ analyzedDocument: academicSolver.analyzedDocument, contextMarkdown }, {
            onSuccess: (data) => {
                updateProject(p => { p.academicSolver.setSolvedDocument(data); });
                toast({ title: t('builder.academicSolver.toasts.solvingSuccess') });
            },
            onError: (error: any) => {
                updateProject(p => { p.academicSolver.setStage('readyToSolve'); });
                toast({ title: t('builder.toasts.errorTitle'), description: error.message, variant: 'destructive' });
            }
        });
    };

    const handleExportDocx = () => {
        if (academicSolver.analyzedDocument && academicSolver.solvedDocument) {
            exportDocumentAsDocx(academicSolver.analyzedDocument, academicSolver.solvedDocument);
        }
    }

    const isProcessing = analyzeMutation.isPending || solveMutation.isPending;
    const canAnalyze = academicSolver.questionDocuments.length > 0 && !!academicSolver.documentType && !isProcessing && (userProfile?.credits ?? 0) >= creditCostAnalyze;
    const canSolve = academicSolver.stage === 'readyToSolve' && !isProcessing && (userProfile?.credits ?? 0) >= creditCostSolve;

    const totalPages = 1 + (academicSolver.solvedDocument?.solutions?.length || 0);

    const handleNextPage = () => { if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1); };
    const handlePrevPage = () => { if (currentPage > 0) setCurrentPage(currentPage - 1); };

    return {
        t, locale, isPanelCollapsed, setIsPanelCollapsed, isProjectLoaded: true, academicSolver,
        stage: academicSolver.stage, documentType: academicSolver.documentType, analyzedDocument: academicSolver.analyzedDocument,
        solvedDocument: academicSolver.solvedDocument, questionDocuments: academicSolver.questionDocuments, externalContext: academicSolver.externalContext,
        setDocumentType: (newType: AcademicDocumentType | null) => updateProject(p => { p.academicSolver.setDocumentType(newType); }),
        addQuestionDocument: (fileName: string, content: string) => updateProject(p => { p.academicSolver.addQuestionDocument(fileName, content); }),
        removeQuestionDocument: (index: number) => updateProject(p => { p.academicSolver.removeQuestionDocument(index); }),
        addExternalContext: (fileName: string, content: string) => updateProject(p => { p.academicSolver.addExternalContext(fileName, content); }),
        removeExternalContext: (index: number) => updateProject(p => { p.academicSolver.removeExternalContext(index); }),
        resetCurrent: () => updateProject(p => { p.academicSolver.reset(); }),
        currentPage, analyzeMutation, solveMutation, handleAnalyze, handleSolve, handleExportDocx, isProcessing, canAnalyze, canSolve,
        totalPages, handleNextPage, handlePrevPage,
    };
}
