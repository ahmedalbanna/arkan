
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAcademicSolverLogic } from '@/hooks';
import { cn } from '@/lib/utils';
import { BrainCircuit, GraduationCap, PanelRightOpen, Sparkles } from 'lucide-react';
import { ContentPanel } from './ContentPanel';
import { ControlPanel } from './ControlPanel';


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
    <div className="relative h-full">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 rounded-lg opacity-50 pointer-events-none"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-purple-500/10 rounded-full blur-lg animate-float pointer-events-none" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start h-full" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {/* Collapsed Panel Button */}
        {isPanelCollapsed && (
          <AnimatedContainer animation="fade-in-left" delay={0}>
            <div className="hidden lg:block lg:col-span-1 sticky top-24">
              <Card variant="glass" className="p-2 backdrop-blur-md">
                <Button
                  variant="secondary"
                  className="h-auto p-3 rounded-lg w-full flex flex-col items-center gap-2 hover:shadow-glow transition-all duration-200"
                  onClick={() => setIsPanelCollapsed(false)}
                >
                  <PanelRightOpen className="h-5 w-5" />
                  <span className="text-xs font-medium text-center">
                    Academic Tools
                  </span>
                </Button>
              </Card>
            </div>
          </AnimatedContainer>
        )}

        {/* Control Panel */}
        <div className={cn("lg:col-span-4 h-full transition-all duration-300", isPanelCollapsed && "lg:hidden")}>
          <AnimatedContainer animation="fade-in-up" delay={200}>
            <Card variant="glass" className="h-full backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
              <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-soft">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-headline">Academic Tools</CardTitle>
                    <CardDescription className="text-sm">Configure your academic solver</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-full p-4 sm:p-6">
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
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>


        {/* Content Panel */}
        <div className={cn("transition-all duration-300", isPanelCollapsed ? "lg:col-span-11" : "lg:col-span-8")}>
          <AnimatedContainer animation="fade-in-up" delay={400}>
            <Card variant="glass" className="h-full backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-soft">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-headline">Academic Solver</CardTitle>
                    <CardDescription className="text-sm">AI-powered academic document analysis and solving</CardDescription>
                  </div>
                  {solvedDocument && (
                    <Badge variant="secondary" className="shadow-soft">
                      <BrainCircuit className="h-3 w-3 mr-1" />
                      Solved
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="h-full p-4 sm:p-6">
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
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>

      </div>
    </div>
  );
}
