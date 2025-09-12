'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/Localization/LocalizationContext';
import { useBuilderStore } from '@/hooks'; // NEW: Use useBuilderStore
import { useAnalyzeAcademicDocument, useSolveAcademicDocument } from '@/hooks';
import { exportDocumentAsDocx } from '@/lib/academic-exporter';
import type { AcademicSolverStage, AcademicDocumentType, AnalyzedDocument, SolvedDocument } from '@/ai/schemas';
import type { ExternalContext } from '@/lib/types';

export function useAcademicSolverLogic() {
    const { t, locale } = useLocalization();
    const { toast } = useToast();
    const { firebaseUser, userProfile } = useAuth();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

    // Get project and setters from useBuilderStore
    const { project, setProject } = useBuilderStore();

    // Destructure academicSolver state from the project
    const { stage, documentType, analyzedDocument, solvedDocument, questionDocuments, externalContext } = project?.academicSolver || {};

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
        if (!project) return; // Ensure project exists
        if (questionDocuments?.length === 0 || !documentType || !firebaseUser) {
            toast({ title: t('builder.academicSolver.toasts.analysisError'), description: t('builder.academicSolver.toasts.analysisErrorDesc'), variant: 'destructive' });
            return;
        }
        project.setAcademicSolverStage('analyzing');
        setProject(project); // Update store

        const combinedQuestionContent = questionDocuments.map(doc => `--- Content from: ${doc.fileName} ---\n${doc.content}`).join('\n\n');

        analyzeMutation.mutate({ markdown: combinedQuestionContent, documentType }, {
            onSuccess: (data) => {
                if (!project) return; // Re-check project
                project.setAcademicSolverAnalyzedDocument(data);
                project.setAcademicSolverStage('readyToSolve');
                setProject(project); // Update store
                toast({ title: t('builder.academicSolver.toasts.analysisSuccess') });
            },
            onError: (error: any) => {
                if (!project) return; // Re-check project
                project.setAcademicSolverStage('idle');
                setProject(project); // Update store
                toast({ title: t('builder.toasts.errorTitle'), description: error.message, variant: 'destructive' });
            }
        });
    };

    const handleSolve = async () => {
        if (!project) return; // Ensure project exists
        if (!analyzedDocument || !firebaseUser) {
            toast({ title: t('builder.academicSolver.toasts.analysisMissing'), variant: 'destructive' });
            return;
        }
        project.setAcademicSolverStage('solving');
        setProject(project); // Update store

        let contextMarkdown: string | undefined = undefined;
        if (externalContext && externalContext.length > 0) {
            contextMarkdown = externalContext.map(c => `--- Context from: ${c.fileName} ---\n${c.content}`).join('\n\n');
        }

        solveMutation.mutate({ analyzedDocument, contextMarkdown }, {
            onSuccess: (data) => {
                if (!project) return; // Re-check project
                project.setAcademicSolverSolvedDocument(data);
                project.setAcademicSolverStage('solved');
                setProject(project); // Update store
                toast({ title: t('builder.academicSolver.toasts.solvingSuccess') });
            },
            onError: (error: any) => {
                if (!project) return; // Re-check project
                project.setAcademicSolverStage('readyToSolve');
                setProject(project); // Update store
                toast({ title: t('builder.toasts.errorTitle'), description: error.message, variant: 'destructive' });
            }
        });
    };

    const handleExportDocx = () => {
        if (analyzedDocument && solvedDocument) {
            exportDocumentAsDocx(analyzedDocument, solvedDocument);
        }
    }

    const isProcessing = analyzeMutation.isPending || solveMutation.isPending;
    const canAnalyze = (questionDocuments?.length || 0) > 0 && !!documentType && !isProcessing && (userProfile?.credits ?? 0) >= creditCostAnalyze;
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

    // New setters for AcademicSolverState properties
    const setStage = (newStage: AcademicSolverStage) => {
        if (!project) return;
        project.setAcademicSolverStage(newStage);
        setProject(project);
    };
    const setDocumentType = (newType: AcademicDocumentType | null) => {
        if (!project) return;
        project.setAcademicSolverDocumentType(newType);
        setProject(project);
    };
    const setAnalyzedDocument = (doc: AnalyzedDocument | null) => {
        if (!project) return;
        project.setAcademicSolverAnalyzedDocument(doc);
        setProject(project);
    };
    const setSolvedDocument = (sol: SolvedDocument | null) => {
        if (!project) return;
        project.setAcademicSolverSolvedDocument(sol);
        setProject(project);
    };
    const addQuestionDocument = (fileName: string, content: string) => {
        if (!project) return;
        project.addAcademicSolverQuestionDocument(fileName, content);
        setProject(project);
    };
    const removeQuestionDocument = (index: number) => {
        if (!project) return;
        project.removeAcademicSolverQuestionDocument(index);
        setProject(project);
    };
    const addExternalContext = (fileName: string, content: string) => {
        if (!project) return;
        project.addAcademicSolverExternalContext(fileName, content);
        setProject(project);
    };
    const removeExternalContext = (index: number) => {
        if (!project) return;
        project.removeAcademicSolverExternalContext(index);
        setProject(project);
    };
    const newAcademicSession = () => {
        if (!project) return;
        // Reset academicSolver part of the project
        project.academicSolver = {
            stage: "idle",
            documentType: null,
            analyzedDocument: null,
            solvedDocument: null,
            questionDocuments: [],
            externalContext: [],
        };
        setProject(project);
    };

    return {
        t,
        locale,
        isPanelCollapsed,
        setIsPanelCollapsed,
        // Expose academicSolver state from project
        stage: project?.academicSolver?.stage || 'idle',
        documentType: project?.academicSolver?.documentType || null,
        analyzedDocument: project?.academicSolver?.analyzedDocument || null,
        solvedDocument: project?.academicSolver?.solvedDocument || null,
        questionDocuments: project?.academicSolver?.questionDocuments || [],
        externalContext: project?.academicSolver?.externalContext || [],
        // Expose new setters
        setStage,
        setDocumentType,
        setAnalyzedDocument,
        setSolvedDocument,
        addQuestionDocument,
        removeQuestionDocument,
        addExternalContext,
        removeExternalContext,
        newSession: newAcademicSession, // Map newSession to newAcademicSession
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