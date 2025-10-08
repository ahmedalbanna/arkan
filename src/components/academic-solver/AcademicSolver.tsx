
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Wand2, BrainCircuit, CheckSquare, Download, FileText, ChevronLeft, ChevronRight, PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-styles';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAcademicSolverStore } from '@/hooks/useAcademicSolverStore';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { AcademicUploaders } from './AcademicUploaders';
import { exportDocumentAsDocx } from '@/lib/academic-exporter';
import { useAnalyzeAcademicDocument, useSolveAcademicDocument } from '@/hooks/use-academic-solver';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';


const A4Page = ({ children, title }: { children: React.ReactNode, title?: string }) => (
    <div className="bg-background shadow-lg p-8 md:p-12 mx-auto my-4 max-w-a4 w-full overflow-hidden" style={{ minHeight: '297mm' }}>
        {title && <h2 className="text-2xl font-bold font-headline text-primary border-b pb-2 mb-6">{title}</h2>}
        <div className="prose dark:prose-invert max-w-none text-sm">{children}</div>
    </div>
);


export default function AcademicSolver() {
  const { t, locale } = useLocalization();
  const { toast } = useToast();
  const { firebaseUser, userProfile } = useAuth();
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  const {
    stage,
    documentType,
    analyzedDocument,
    solvedDocument,
    questionDocuments,
    externalContext,
    setStage,
    setDocumentType,
    addQuestionDocument,
    removeQuestionDocument,
    setAnalyzedDocument,
    setSolvedDocument,
    addExternalContext,
    removeExternalContext,
    resetCurrent,
  } = useAcademicSolverStore();

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
    setStage('analyzing');

    const combinedQuestionContent = questionDocuments.map(doc => `--- Content from: ${doc.fileName} ---\n${doc.content}`).join('\n\n');

    analyzeMutation.mutate({ markdown: combinedQuestionContent, documentType }, {
        onSuccess: (data) => {
            setAnalyzedDocument(data);
            setStage('readyToSolve');
            toast({ title: t('builder.academicSolver.toasts.analysisSuccess') });
        },
        onError: (error: any) => {
            toast({ title: t('builder.toasts.errorTitle'), description: error.message, variant: 'destructive' });
            setStage('idle');
        }
    });
  };

  const handleSolve = async () => {
    if (!analyzedDocument || !firebaseUser) {
      toast({ title: t('builder.academicSolver.toasts.analysisMissing'), variant: 'destructive' });
        return;
    }
    setStage('solving');

    let contextMarkdown: string | undefined = undefined;
    if (externalContext && externalContext.length > 0) {
      contextMarkdown = externalContext.map(c => `--- Context from: ${c.fileName} ---\n${c.content}`).join('\n\n');
    }

    solveMutation.mutate({ analyzedDocument, contextMarkdown }, {
        onSuccess: (data) => {
            setSolvedDocument(data);
            setStage('solved');
            toast({ title: t('builder.academicSolver.toasts.solvingSuccess') });
        },
        onError: (error: any) => {
            toast({ title: t('builder.toasts.errorTitle'), description: error.message, variant: 'destructive' });
            setStage('readyToSolve');
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

  const renderContentPage = () => {
    if (currentPage === 0) {
      // Analysis Page
      return (
        <A4Page title="Analysis">
            {stage === 'analyzing' || analyzeMutation.isPending ? (
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
    if (!solution) return <Skeleton className="w-full h-[297mm]"/>;

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


  const controlPanel = (
    <Card className="h-full flex flex-col">
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>{t('builder.academicSolver.uploadCardTitle')}</CardTitle>
                <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={() => setIsPanelCollapsed(true)}>
                    <PanelLeftOpen className="h-5 w-5" />
                </Button>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 grow overflow-y-auto pr-2">
             <RadioGroup
                value={documentType || undefined}
                onValueChange={(value) => setDocumentType(value as 'exam' | 'homework')}
                className="grid grid-cols-2 gap-4"
                disabled={isProcessing}
            >
                <div>
                    <RadioGroupItem value="exam" id="exam" className="peer sr-only" />
                    <Label htmlFor="exam" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                        {t('builder.academicSolver.examType')}
                    </Label>
                </div>
                <div>
                    <RadioGroupItem value="homework" id="homework" className="peer sr-only" />
                    <Label htmlFor="homework" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                        {t('builder.academicSolver.homeworkType')}
                    </Label>
                </div>
            </RadioGroup>

             <AcademicUploaders
                title={t('builder.academicSolver.questionsDocument')}
                onContentAdded={addQuestionDocument}
                onContentRemoved={removeQuestionDocument}
                isProcessing={isProcessing}
                uploadedContent={questionDocuments}
                isContext={false}
             />

             <AcademicUploaders
                title={t('builder.academicSolver.contextSyllabus')}
                onContentAdded={addExternalContext}
                onContentRemoved={removeExternalContext}
                isProcessing={isProcessing}
                uploadedContent={externalContext}
                isContext
             />

            <Button onClick={handleAnalyze} disabled={!canAnalyze} className="w-full">
                {analyzeMutation.isPending ? (
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                ) : (
                    <Sparkles className="me-2 h-4 w-4" />
                )}
                {t('builder.academicSolver.analyzeButton')}
            </Button>
        </CardContent>
        <CardFooter>
             <Button onClick={resetCurrent} variant="outline" className="w-full">{t('builder.academicSolver.newSession')}</Button>
        </CardFooter>
    </Card>
  );

  const contentPanel = (
     <Card className="min-h-[calc(100vh-250px)] flex flex-col">
       <CardHeader>
         <div className="flex justify-between items-start flex-col lg:flex-row">
              <div >
                  <CardTitle>{analyzedDocument ? analyzedDocument.subject : t('builder.academicSolver.documentTitle')}</CardTitle>
                  <CardDescription>{analyzedDocument ? analyzedDocument.title : t('builder.academicSolver.begin')}</CardDescription>
              </div>
              <div className="flex gap-2 flex-col sm:flex-row">
                 {(stage === 'readyToSolve' || stage === 'solving' || stage === 'solved') && (
                      <Button onClick={handleSolve} disabled={!canSolve}>
                          {solveMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Wand2 className="me-2 h-4 w-4" />}
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
       <div className="grow bg-slate-200 dark:bg-slate-900/50 p-4 rounded-b-lg">
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
  )


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
        {controlPanel}
      </div>
      <div className={cn("transition-all duration-300", isPanelCollapsed ? "lg:col-span-11" : "lg:col-span-8")}>
        {contentPanel}
      </div>
    </div>
  );
}
