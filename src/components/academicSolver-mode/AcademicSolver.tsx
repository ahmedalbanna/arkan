
'use client';

import { Button } from '@/components/ui/button';
import { PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { cn } from '@/lib/utils';
import { useAcademicSolverLogic } from '@/hooks/use-academic-solver-logic';
import { ControlPanel } from './ControlPanel';
import { ContentPanel } from './ContentPanel';


export default function AcademicSolver() {
  const {
    t,
    locale,
    isPanelCollapsed,
    setIsPanelCollapsed,
    stage,
    documentType,
    analyzedDocument,
    solvedDocument,
    questionDocuments,
    externalContext,
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
  } = useAcademicSolverLogic();


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {isPanelCollapsed && (
            <div className="hidden lg:block lg:col-span-1 sticky top-24">
                 <Button
                    variant="secondary"
                    className="h-auto p-2 rounded-l-none [writing-mode:vertical-lr] transform rotate-180"
                    onClick={() => setIsPanelCollapsed(false)}
                >
                    <PanelRightOpen className="h-5 w-5 mb-2" />
                    {t('builder.academicSolver.uploadCardTitle')}
                </Button>
            </div>
        )}
      <div className={cn("lg:col-span-4 h-full transition-all duration-300", isPanelCollapsed && "lg:hidden")}>
        <ControlPanel
            onCollapse={() => setIsPanelCollapsed(true)}
            documentType={documentType}
            setDocumentType={setDocumentType}
            isProcessing={isProcessing}
            addQuestionDocument={addQuestionDocument}
            removeQuestionDocument={removeQuestionDocument}
            questionDocuments={questionDocuments}
            addExternalContext={addExternalContext}
            removeExternalContext={removeExternalContext}
            externalContext={externalContext}
            handleAnalyze={handleAnalyze}
            canAnalyze={canAnalyze}
            isAnalyzing={analyzeMutation.isPending}
            resetCurrent={resetCurrent}
        />
      </div>
      <div className={cn("transition-all duration-300", isPanelCollapsed ? "lg:col-span-11" : "lg:col-span-8")}>
        <ContentPanel
            stage={stage as "idle" | "analyzing" | "readyToSolve" | "solving" | "solved"}
            analyzedDocument={analyzedDocument}
            solvedDocument={solvedDocument}
            handleSolve={handleSolve}
            canSolve={canSolve}
            isSolving={solveMutation.isPending}
            handleExportDocx={handleExportDocx}
            totalPages={totalPages}
            currentPage={currentPage}
            handlePrevPage={handlePrevPage}
            handleNextPage={handleNextPage}
            isAnalyzing={analyzeMutation.isPending}
            documentType={documentType}
        />
      </div>
    </div>
  );
}
