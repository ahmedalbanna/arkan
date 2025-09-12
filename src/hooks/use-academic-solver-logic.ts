
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks'; // NEW: Use useBuilderStore
import { useAnalyzeAcademicDocument, useSolveAcademicDocument } from '@/hooks';
import { exportDocumentAsDocx } from '@/lib/academic-exporter';
import { AnalyzedDocument, SolvedDocument, AcademicDocumentType } from '@/ai/schemas';
import { AcademicSolverStage } from '@/lib/types';
import { Project } from '@/lib/models/project';

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

    // Get project and setters from useBuilderStore
    const { project, setProject } = useBuilderStore();

    // Destructure academicSolver state from the project
    const academicSolverState = project?.academicSolver;

    const [currentPage, setCurrentPage] = useState(0);

    const analyzeMutation = useAnalyzeAcademicDocument();
    const solveMutation = useSolveAcademicDocument();

    // Reset to first page when content changes
    useEffect(() => {
        setCurrentPage(0);
    }, [academicSolverState?.analyzedDocument, academicSolverState?.solvedDocument]);

    const creditCostAnalyze = 1;
    const creditCostSolve = academicSolverState?.analyzedDocument?.documentType === 'exam' ? 3 : 2;

    const handleAnalyze = async () => {
        if (!project || !academicSolverState) return; // Ensure project and academicSolver exist
        if (academicSolverState.questionDocuments.length === 0 || !academicSolverState.documentType || !firebaseUser) {
            toast({ title: t('builder.academicSolver.toasts.analysisError'), description: t('builder.academicSolver.toasts.analysisErrorDesc'), variant: 'destructive' });
            return;
        }
        
        project.setAcademicSolverStage('analyzing');
        setProject(new Project(project));

        const combinedQuestionContent = academicSolverState.questionDocuments.map(doc => `--- Content from: ${doc.fileName} ---\n${doc.content}`).join('\n\n');

        analyzeMutation.mutate({ markdown: combinedQuestionContent, documentType: academicSolverState.documentType }, {
            onSuccess: (data) => {
                project.setAcademicSolverAnalyzedDocument(data);
                setProject(new Project(project)); 
                toast({ title: t('builder.academicSolver.toasts.analysisSuccess') });
            },
            onError: (error: any) => {
                project.setAcademicSolverStage('idle');
                setProject(new Project(project)); 
                toast({ title: t('builder.toasts.errorTitle'), description: error.message, variant: 'destructive' });
            }
        });
    };

    const handleSolve = async () => {
        if (!project || !academicSolverState || !academicSolverState.analyzedDocument || !firebaseUser) {
            toast({ title: t('builder.academicSolver.toasts.analysisMissing'), variant: 'destructive' });
            return;
        }
        project.setAcademicSolverStage('solving');
        setProject(new Project(project));

        let contextMarkdown: string | undefined = undefined;
        if (academicSolverState.externalContext && academicSolverState.externalContext.length > 0) {
            contextMarkdown = academicSolverState.externalContext.map(c => `--- Context from: ${c.fileName} ---\n${c.content}`).join('\n\n');
        }

        solveMutation.mutate({ analyzedDocument: academicSolverState.analyzedDocument, contextMarkdown }, {
            onSuccess: (data) => {
                project.setAcademicSolverSolvedDocument(data);
                setProject(new Project(project));
                toast({ title: t('builder.academicSolver.toasts.solvingSuccess') });
            },
            onError: (error: any) => {
                project.setAcademicSolverStage('readyToSolve');
                setProject(new Project(project));
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

    const setDocumentType = (newType: AcademicDocumentType | null) => {
        if (!project) return;
        project.setAcademicSolverDocumentType(newType);
        setProject(new Project(project));
    };

    const addQuestionDocument = (fileName: string, content: string) => {
        if (!project) return;
        project.addAcademicSolverQuestionDocument(fileName, content);
        setProject(new Project(project));
    };
    
    const removeQuestionDocument = (index: number) => {
        if (!project) return;
        project.removeAcademicSolverQuestionDocument(index);
        setProject(new Project(project));
    };
    
    const addExternalContext = (fileName: string, content: string) => {
        if (!project) return;
        project.addAcademicSolverExternalContext(fileName, content);
        setProject(new Project(project));
    };
    
    const removeExternalContext = (index: number) => {
        if (!project) return;
        project.removeAcademicSolverExternalContext(index);
        setProject(new Project(project));
    };

    const resetCurrent = () => {
        if (!project) return;
        project.resetAcademicSolver();
        setProject(new Project(project));
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
        setDocumentType,
        addQuestionDocument,
        removeQuestionDocument,
        addExternalContext,
        removeExternalContext,
        resetCurrent,
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
