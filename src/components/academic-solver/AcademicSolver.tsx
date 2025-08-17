
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Wand2, BrainCircuit, CheckSquare, Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAcademicSolverStore } from '@/hooks/useAcademicSolverStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { AcademicUploaders } from './AcademicUploaders';
import { exportDocumentAsDocx } from '@/lib/academic-exporter';
import { useAnalyzeAcademicDocument, useSolveAcademicDocument } from '@/hooks/use-academic-solver';


export default function AcademicSolver() {
  const { t } = useLocalization();
  const { toast } = useToast();
  const { firebaseUser, refetchUser, userProfile } = useAuth();

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

  const analyzeMutation = useAnalyzeAcademicDocument();
  const solveMutation = useSolveAcademicDocument();

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
            refetchUser();
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
            refetchUser();
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


  const controlPanel = (
    <Card>
        <CardHeader>
            <CardTitle>{t('builder.academicSolver.uploadCardTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                )}
                {t('builder.academicSolver.analyzeButton')} ({creditCostAnalyze} {t('builder.academicSolver.creditLabel')})
            </Button>
        </CardContent>
        <CardFooter>
             <Button onClick={resetCurrent} variant="outline" className="w-full">{t('builder.academicSolver.newSession')}</Button>
        </CardFooter>
    </Card>
  );

  const contentPanel = (
     <Card className="min-h-[calc(100vh-250px)] flex flex-col">
       <Tabs defaultValue="analysis" className="w-full flex flex-col flex-grow">
          <CardHeader>
             <div className="flex justify-between items-start">
                  <div>
                      <CardTitle>{analyzedDocument ? analyzedDocument.subject : t('builder.academicSolver.documentTitle')}</CardTitle>
                      <CardDescription>{analyzedDocument ? analyzedDocument.title : t('builder.academicSolver.begin')}</CardDescription>
                  </div>
                   <TabsList>
                      <TabsTrigger value="analysis">{t('builder.academicSolver.analysisTab')}</TabsTrigger>
                      <TabsTrigger value="solution" disabled={stage !== 'solved' && stage !== 'solving'}>{t('builder.academicSolver.solutionTab')}</TabsTrigger>
                  </TabsList>
             </div>
          </CardHeader>
          <TabsContent value="analysis" className="flex-grow">
             <CardContent>
                 <ScrollArea className="h-[calc(100vh-350px)] p-1">
                      {stage === 'analyzing' || analyzeMutation.isPending ? (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                              <Loader2 className="h-12 w-12 animate-spin mb-4" />
                              <p>{t('builder.academicSolver.toasts.analyzingInProgress', {type: documentType})}</p>
                          </div>
                      ) : analyzedDocument ? (
                          <ReactMarkdown components={markdownComponents}>{analyzedDocument.structuredContent}</ReactMarkdown> 
                      ) : (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                              <BrainCircuit className="h-12 w-12 mb-4" />
                              <p>{t('builder.academicSolver.analysisPlaceholder')}</p>
                          </div>
                      )}
                  </ScrollArea>
             </CardContent>
             <CardFooter>
                 {(stage === 'readyToSolve' || stage === 'solving' || stage === 'solved') && (
                      <Button onClick={handleSolve} disabled={!canSolve} className="w-full">
                          {solveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                          {t('builder.academicSolver.solveButton')} ({creditCostSolve} {t('builder.academicSolver.creditLabelPlural')})
                      </Button>
                  )}
             </CardFooter>
          </TabsContent>
           <TabsContent value="solution" className="flex-grow">
              <CardContent>
                  <ScrollArea className="h-[calc(100vh-350px)] p-1">
                       {stage === 'solving' || solveMutation.isPending ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                          <Loader2 className="h-12 w-12 animate-spin mb-4" />
                          <p>{t('builder.academicSolver.solvingInProgress')}</p>
                        </div>
                      ) : solvedDocument && Array.isArray(solvedDocument.solutions) ? (
                        <div className="prose dark:prose-invert max-w-none space-y-6">
                          {solvedDocument.solutions.map((pair, index) => (
                              <div key={index} className="space-y-2 border-b pb-4 last:border-b-0">
                                  <ReactMarkdown components={markdownComponents}>{pair.question}</ReactMarkdown>
                                  <div className="p-4 rounded-md bg-muted/50 border border-border">
                                       <ReactMarkdown components={markdownComponents}>{pair.solution}</ReactMarkdown>
                                  </div>
                              </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                          <CheckSquare className="h-12 w-12 mb-4" />
                            <p>{t('builder.academicSolver.solutionPlaceholder')}</p>
                        </div>
                      )}
                  </ScrollArea>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button onClick={handleExportDocx} disabled={stage !== 'solved'} className="flex-1">
                    <FileText className="mr-2 h-4 w-4" /> {t('builder.academicSolver.exportDocx')}
                </Button>
                <Button onClick={() => alert("PDF Export coming soon!")} disabled={stage !== 'solved'} className="flex-1">
                    <Download className="mr-2 h-4 w-4" /> {t('builder.academicSolver.exportPdf')}
                </Button>
              </CardFooter>
           </TabsContent>
       </Tabs>
     </Card>
  )


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-3">
        {controlPanel}
      </div>
      <div className="lg:col-span-9">
        {contentPanel}
      </div>
    </div>
  );
}
