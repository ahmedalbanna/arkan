
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, UploadCloud, AlertCircle, Sparkles, Wand2, History, Trash2, Download, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AnalyzedExam, SolvedExam } from '@/ai/flows/exam-solver.shared';
import { useExamSolverStore } from '@/hooks/useExamSolverStore';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportExamAsDocx, exportExamAsPdf } from '@/lib/exam-exporter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


type ExamSolverStage = 'idle' | 'parsing' | 'analyzing' | 'readyToSolve' | 'solving' | 'solved';

// API call to convert PDF to Markdown
async function parsePdf(formData: FormData, token: string): Promise<{ markdown: string }> {
  const response = await fetch('/api/pdf-to-markdown', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) throw new Error((await response.json()).message || 'PDF parsing failed.');
  return response.json();
}

// API call to analyze the exam
async function analyzeExam(markdown: string, token: string): Promise<AnalyzedExam> {
  const response = await fetch('/api/exam-solver/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ markdown }),
  });
  if (!response.ok) throw new Error((await response.json()).message || 'Exam analysis failed.');
  return response.json();
}

// API call to solve the exam
async function solveExam(analyzedExam: AnalyzedExam, token: string): Promise<SolvedExam> {
  const response = await fetch('/api/exam-solver/solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ analyzedExam }),
  });
  if (!response.ok) throw new Error((await response.json()).message || 'Exam solving failed.');
  return response.json();
}

export default function ExamSolver() {
  const { t } = useLocalization();
  const { toast } = useToast();
  const { firebaseUser, refetchUser } = useAuth();
  const queryClient = useQueryClient();

  const {
    stage,
    analyzedExam,
    solvedExam,
    originalFile,
    history,
    setStage,
    setAnalyzedExam,
    setSolvedExam,
    setOriginalFile,
    addSolvedExamToHistory,
    clearHistory,
    loadFromHistory,
    currentHistoryId,
  } = useExamSolverStore();

  const parseMutation = useMutation({ mutationFn: (vars: { formData: FormData, token: string }) => parsePdf(vars.formData, vars.token) });
  const analyzeMutation = useMutation({ mutationFn: (vars: { markdown: string, token: string }) => analyzeExam(vars.markdown, vars.token) });
  const solveMutation = useMutation({ mutationFn: (vars: { analyzedExam: AnalyzedExam, token: string }) => solveExam(vars.analyzedExam, vars.token) });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      await setOriginalFile(selectedFile);
    } else {
      toast({ title: t('builder.examSolver.toasts.invalidFile'), variant: 'destructive' });
      await setOriginalFile(null);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!originalFile || !firebaseUser) {
      toast({ title: t('builder.examSolver.toasts.authError'), variant: 'destructive' });
      return;
    }
    const token = await firebaseUser.getIdToken();

    setStage('parsing');
    const fileBlob = await (await fetch(originalFile.dataUrl)).blob();
    const formData = new FormData();
    formData.append('file', fileBlob, originalFile.name);

    try {
      const parsedData = await parseMutation.mutateAsync({ formData, token });
      refetchUser();

      setStage('analyzing');
      const analysisData = await analyzeMutation.mutateAsync({ markdown: parsedData.markdown, token });
      setAnalyzedExam(analysisData);
      setStage('readyToSolve');
      refetchUser();
      toast({ title: t('builder.examSolver.toasts.analysisSuccess') });
    } catch (error: any) {
      toast({ title: t('builder.examSolver.toasts.errorTitle'), description: error.message, variant: 'destructive' });
      setStage('idle');
    }
  };

  const handleSolveExam = async () => {
    if (!analyzedExam || !firebaseUser || !originalFile) {
      toast({ title: t('builder.examSolver.toasts.analysisMissing'), variant: 'destructive' });
        return;
    }
    const token = await firebaseUser.getIdToken();
    setStage('solving');
    try {
      const solvedData = await solveMutation.mutateAsync({ analyzedExam, token });
      setSolvedExam(solvedData);
      addSolvedExamToHistory(analyzedExam, solvedData, originalFile);
      setStage('solved');
      refetchUser();
      toast({ title: t('builder.examSolver.toasts.solvingSuccess') });
    } catch (error: any) {
      toast({ title: t('builder.examSolver.toasts.errorTitle'), description: error.message, variant: 'destructive' });
      setStage('readyToSolve');
    }
  };

  const handleDownloadOriginal = () => {
    if (!originalFile) return;
    const link = document.createElement('a');
    link.href = originalFile.dataUrl;
    link.download = originalFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isProcessing = ['parsing', 'analyzing', 'solving'].includes(stage);

  const analysisPanel = (
    analyzedExam ? (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>{t('builder.examSolver.analysisCardTitle')}</CardTitle>
          <CardDescription>{analyzedExam.subject} - {analyzedExam.specialty}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <ScrollArea className="flex-grow p-1">
            <ReactMarkdown components={markdownComponents}>{analyzedExam.structuredExam}</ReactMarkdown>
          </ScrollArea>
          {(stage === 'readyToSolve' || stage === 'solving' || stage === 'solved') && (
            <Button onClick={handleSolveExam} disabled={stage !== 'readyToSolve'} className="mt-4 w-full">
              {stage === 'solving' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              {t('builder.examSolver.solveButton')}
            </Button>
          )}
        </CardContent>
      </Card>
    ) : (
        <Card className="min-h-[calc(100vh-250px)] flex items-center justify-center">
             <div className="text-center text-muted-foreground p-8">
                 <AlertCircle className="h-12 w-12 mb-4 mx-auto" />
            <p>{t('builder.examSolver.analysisPlaceholder')}</p>
             </div>
        </Card>
    )
  );

  const solutionPanel = (
     <Card className="min-h-[calc(100vh-250px)] flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t('builder.examSolver.solutionCardTitle')}</CardTitle>
            {solvedExam && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => exportExamAsDocx(analyzedExam!, solvedExam, 'modern')}>
                           <FileDown className="mr-2 h-4 w-4" /> Export as DOCX
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportExamAsPdf(analyzedExam!, solvedExam)}>
                            <FileDown className="mr-2 h-4 w-4" /> Export as PDF
                        </DropdownMenuItem>
                         {originalFile && (
                            <DropdownMenuItem onClick={handleDownloadOriginal}>
                                <FileDown className="mr-2 h-4 w-4" /> Download Original PDF
                            </DropdownMenuItem>
                         )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
        <CardDescription>{t('builder.examSolver.solutionCardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {isProcessing && stage === 'solving' && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p>{t('builder.examSolver.solvingInProgress')}</p>
          </div>
        )}
        {solvedExam ? (
          <ScrollArea className="h-[calc(100vh-350px)] p-1">
            <ReactMarkdown components={markdownComponents}>{solvedExam.solution}</ReactMarkdown>
          </ScrollArea>
        ) : stage !== 'solving' && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-4" />
              <p>{t('builder.examSolver.solutionPlaceholder')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* --- DESKTOP VIEW --- */}
      <div className="hidden lg:block lg:col-span-3 space-y-6">
         <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" /> {t('builder.examSolver.historyTitle')}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={clearHistory} disabled={history.length === 0} title={t('examSolver.clearHistoryTooltip')}>
                    <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            <CardDescription>{t('builder.examSolver.historyDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                {history.length > 0 ? (
                  <div className="space-y-2 pr-2">
                    {history.map(item => (
                       <Button
                        key={item.id}
                        variant="ghost"
                        onClick={() => loadFromHistory(item.id)}
                        className={cn(
                            "w-full h-auto justify-start text-left p-2",
                            currentHistoryId === item.id && "bg-muted"
                        )}
                      >
                         <div className="flex flex-col">
                            <span className="font-semibold truncate">{item.analyzedExam.specialty}</span>
                             <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(item.id), { addSuffix: true })}
                            </span>
                         </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center p-4">{t('examSolver.historyEmpty')}</p>
                )}
              </ScrollArea>
            </CardContent>
         </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('builder.examSolver.uploadCardTitle')}</CardTitle>
            <CardDescription>{t('builder.examSolver.uploadCardDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input type="file" accept=".pdf" onChange={handleFileChange} disabled={isProcessing} />
              <Button onClick={handleUploadAndAnalyze} disabled={!originalFile || isProcessing}>
                {stage === 'parsing' || stage === 'analyzing' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="mr-2 h-4 w-4" />
                )}
                {t('builder.examSolver.uploadAndAnalyzeButton')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:block lg:col-span-4">
        {analysisPanel}
      </div>

      <div className="hidden lg:block lg:col-span-5">
        {solutionPanel}
      </div>

      {/* --- MOBILE VIEW --- */}
      <div className="block lg:hidden col-span-1">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="exam">Exam</TabsTrigger>
                <TabsTrigger value="solution">Solution</TabsTrigger>
            </TabsList>
             <TabsContent value="upload" className="mt-4">
                 <div className="space-y-6">
                    <Card>
                        <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2">
                            <History className="w-5 h-5" /> {t('builder.examSolver.historyTitle')}
                            </CardTitle>
                            <Button variant="ghost" size="icon" onClick={clearHistory} disabled={history.length === 0} title={t('examSolver.clearHistoryTooltip')}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                        <CardDescription>{t('builder.examSolver.historyDescription')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <ScrollArea className="h-48">
                            {history.length > 0 ? (
                            <div className="space-y-2 pr-2">
                                {history.map(item => (
                                <Button
                                    key={item.id}
                                    variant="ghost"
                                    onClick={() => loadFromHistory(item.id)}
                                    className={cn(
                                        "w-full h-auto justify-start text-left p-2",
                                        currentHistoryId === item.id && "bg-muted"
                                    )}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-semibold truncate">{item.analyzedExam.specialty}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(item.id), { addSuffix: true })}
                                        </span>
                                    </div>
                                </Button>
                                ))}
                            </div>
                            ) : (
                            <p className="text-sm text-muted-foreground text-center p-4">{t('examSolver.historyEmpty')}</p>
                            )}
                        </ScrollArea>
                        </CardContent>
                    </Card>
                    <Card>
                    <CardHeader>
                        <CardTitle>{t('builder.examSolver.uploadCardTitle')}</CardTitle>
                        <CardDescription>{t('builder.examSolver.uploadCardDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                        <Input type="file" accept=".pdf" onChange={handleFileChange} disabled={isProcessing} />
                        <Button onClick={handleUploadAndAnalyze} disabled={!originalFile || isProcessing}>
                            {stage === 'parsing' || stage === 'analyzing' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                            <UploadCloud className="mr-2 h-4 w-4" />
                            )}
                            {t('builder.examSolver.uploadAndAnalyzeButton')}
                        </Button>
                        </div>
                    </CardContent>
                    </Card>
                 </div>
            </TabsContent>
            <TabsContent value="exam" className="mt-4">
                {analysisPanel}
            </TabsContent>
            <TabsContent value="solution" className="mt-4">
                {solutionPanel}
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
