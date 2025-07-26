
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Wand2, BrainCircuit, CheckSquare } from 'lucide-react';
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

async function analyzeApi(variables: { markdown: string, documentType: 'exam' | 'homework', token: string }): Promise<any> {
    const { markdown, documentType, token } = variables;
    const response = await fetch('/api/academic-solver/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ markdown, documentType }),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Analysis failed.');
    return response.json();
}

async function solveApi(variables: { analyzedDocument: any, contextMarkdown?: string, token: string }): Promise<any> {
    const { analyzedDocument, contextMarkdown, token } = variables;
    const response = await fetch('/api/academic-solver/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ analyzedDocument, contextMarkdown }),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Solving failed.');
    return response.json();
}

export default function AcademicSolver() {
  const { t } = useLocalization();
  const { toast } = useToast();
  const { firebaseUser, refetchUser } = useAuth();

  const {
    stage,
    documentType,
    analyzedDocument,
    solvedDocument,
    questionContent,
    externalContext,
    setStage,
    setDocumentType,
    setQuestionContent,
    setAnalyzedDocument,
    setSolvedDocument,
    addExternalContext,
    removeExternalContext,
    resetCurrent,
  } = useAcademicSolverStore();

  const analyzeMutation = useMutation({ mutationFn: analyzeApi });
  const solveMutation = useMutation({ mutationFn: solveApi });

  const handleAnalyze = async () => {
    if (!questionContent?.content || !documentType || !firebaseUser) {
      toast({ title: t('builder.academicSolver.toasts.analysisError'), description: "Please provide the document content and select a document type.", variant: 'destructive' });
      return;
    }
    const token = await firebaseUser.getIdToken();
    setStage('analyzing');
    
    try {
      const analysisData = await analyzeMutation.mutateAsync({ markdown: questionContent.content, documentType, token });
      setAnalyzedDocument(analysisData);
      setStage('readyToSolve');
      refetchUser();
      toast({ title: t('builder.academicSolver.toasts.analysisSuccess') });
    } catch (error: any) {
      toast({ title: t('builder.academicSolver.toasts.errorTitle'), description: error.message, variant: 'destructive' });
      setStage('idle');
    }
  };

  const handleSolve = async () => {
    if (!analyzedDocument || !firebaseUser) {
      toast({ title: t('builder.academicSolver.toasts.analysisMissing'), variant: 'destructive' });
        return;
    }
    const token = await firebaseUser.getIdToken();
    setStage('solving');
    
    let contextMarkdown: string | undefined = undefined;
    if (externalContext && externalContext.length > 0) {
      contextMarkdown = externalContext.map(c => `--- Context from: ${c.fileName} ---\n${c.content}`).join('\n\n');
    }
    
    try {
      const solvedData = await solveMutation.mutateAsync({ analyzedDocument, contextMarkdown, token });
      setSolvedDocument(solvedData);
      setStage('solved');
      refetchUser();
      toast({ title: t('builder.academicSolver.toasts.solvingSuccess') });
    } catch (error: any) {
      toast({ title: t('builder.academicSolver.toasts.errorTitle'), description: error.message, variant: 'destructive' });
      setStage('readyToSolve');
    }
  };

  const isProcessing = ['parsing', 'analyzing', 'solving'].includes(stage);

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
                title="Questions Document"
                onContentAdded={(fileName, content) => setQuestionContent({ fileName, content })}
                onContentRemoved={() => setQuestionContent(null)}
                isProcessing={isProcessing}
                uploadedContent={questionContent ? [questionContent] : []}
                isContext={false}
             />
             
             <AcademicUploaders
                title="Context/Syllabus Document (Optional)"
                onContentAdded={addExternalContext}
                onContentRemoved={removeExternalContext}
                isProcessing={isProcessing}
                uploadedContent={externalContext}
                isContext
             />

            <Button onClick={handleAnalyze} disabled={!questionContent || !documentType || isProcessing} className="w-full">
                {stage === 'analyzing' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                )}
                {t('builder.academicSolver.analyzeButton')}
            </Button>
        </CardContent>
        <CardFooter>
             <Button onClick={resetCurrent} variant="outline" className="w-full">New Session</Button>
        </CardFooter>
    </Card>
  );

  const contentPanel = (
     <Card className="min-h-[calc(100vh-250px)] flex flex-col">
       <Tabs defaultValue="analysis" className="w-full flex flex-col flex-grow">
          <CardHeader>
             <div className="flex justify-between items-start">
                  <div>
                      <CardTitle>{analyzedDocument ? analyzedDocument.subject : "Academic Document"}</CardTitle>
                      <CardDescription>{analyzedDocument ? analyzedDocument.title : "Upload a file and analyze to begin"}</CardDescription>
                  </div>
                   <TabsList>
                      <TabsTrigger value="analysis">Analysis</TabsTrigger>
                      <TabsTrigger value="solution" disabled={stage !== 'solved' && stage !== 'solving'}>Solution</TabsTrigger>
                  </TabsList>
             </div>
          </CardHeader>
          <TabsContent value="analysis" className="flex-grow">
             <CardContent>
                 <ScrollArea className="h-[calc(100vh-350px)] p-1">
                      {stage === 'analyzing' ? (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                              <Loader2 className="h-12 w-12 animate-spin mb-4" />
                              <p>{`Analyzing ${documentType}...`}</p>
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
                      <Button onClick={handleSolve} disabled={stage !== 'readyToSolve'} className="w-full">
                          {stage === 'solving' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                          {t('builder.academicSolver.solveButton')}
                      </Button>
                  )}
             </CardFooter>
          </TabsContent>
           <TabsContent value="solution" className="flex-grow">
              <CardContent>
                  <ScrollArea className="h-[calc(100vh-350px)] p-1">
                       {stage === 'solving' ? (
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
