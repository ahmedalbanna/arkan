
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
import type { AnalyzedHomework, SolvedHomework } from '@/ai/flows/homework-solver.shared';
import { useHomeworkSolverStore } from '@/hooks/useHomeworkSolverStore';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportHomeworkAsDocx, exportHomeworkAsPdf } from '@/lib/homework-exporter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


type HomeworkSolverStage = 'idle' | 'parsing' | 'analyzing' | 'readyToSolve' | 'solving' | 'solved';

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

// API call to analyze the homework
async function analyzeHomework(markdown: string, token: string): Promise<AnalyzedHomework> {
  const response = await fetch('/api/homework-solver/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ markdown }),
  });
  if (!response.ok) throw new Error((await response.json()).message || 'Homework analysis failed.');
  return response.json();
}

// API call to solve the homework
async function solveHomework(analyzedHomework: AnalyzedHomework, token: string): Promise<SolvedHomework> {
  const response = await fetch('/api/homework-solver/solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ analyzedHomework }),
  });
  if (!response.ok) throw new Error((await response.json()).message || 'Homework solving failed.');
  return response.json();
}

export default function HomeworkSolver() {
  const { t } = useLocalization();
  const { toast } = useToast();
  const { firebaseUser, refetchUser } = useAuth();
  const queryClient = useQueryClient();

  const {
    stage,
    analyzedHomework,
    solvedHomework,
    originalFile,
    history,
    setStage,
    setAnalyzedHomework,
    setSolvedHomework,
    setOriginalFile,
    addSolvedHomeworkToHistory,
    clearHistory,
    loadFromHistory,
    currentHistoryId,
  } = useHomeworkSolverStore();

  const parseMutation = useMutation({ mutationFn: (vars: { formData: FormData, token: string }) => parsePdf(vars.formData, vars.token) });
  const analyzeMutation = useMutation({ mutationFn: (vars: { markdown: string, token: string }) => analyzeHomework(vars.markdown, vars.token) });
  const solveMutation = useMutation({ mutationFn: (vars: { analyzedHomework: AnalyzedHomework, token: string }) => solveHomework(vars.analyzedHomework, vars.token) });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      await setOriginalFile(selectedFile);
    } else {
      toast({ title: t('builder.homeworkSolver.toasts.invalidFile'), variant: 'destructive' });
      await setOriginalFile(null);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!originalFile || !firebaseUser) {
      toast({ title: t('builder.homeworkSolver.toasts.authError'), variant: 'destructive' });
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
      setAnalyzedHomework(analysisData);
      setStage('readyToSolve');
      refetchUser();
      toast({ title: t('builder.homeworkSolver.toasts.analysisSuccess') });
    } catch (error: any) {
      toast({ title: t('builder.homeworkSolver.toasts.errorTitle'), description: error.message, variant: 'destructive' });
      setStage('idle');
    }
  };

  const handleSolveHomework = async () => {
    if (!analyzedHomework || !firebaseUser || !originalFile) {
      toast({ title: t('builder.homeworkSolver.toasts.analysisMissing'), variant: 'destructive' });
        return;
    }
    const token = await firebaseUser.getIdToken();
    setStage('solving');
    try {
      const solvedData = await solveMutation.mutateAsync({ analyzedHomework, token });
      setSolvedHomework(solvedData);
      addSolvedHomeworkToHistory(analyzedHomework, solvedData, originalFile);
      setStage('solved');
      refetchUser();
      toast({ title: t('builder.homeworkSolver.toasts.solvingSuccess') });
    } catch (error: any) {
      toast({ title: t('builder.homeworkSolver.toasts.errorTitle'), description: error.message, variant: 'destructive' });
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
    analyzedHomework ? (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>{t('builder.homeworkSolver.analysisCardTitle')}</CardTitle>
          <CardDescription>{analyzedHomework.subject} - {analyzedHomework.title}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <ScrollArea className="flex-grow p-1">
            <ReactMarkdown components={markdownComponents}>{analyzedHomework.structuredQuestions}</ReactMarkdown>
          </ScrollArea>
          {(stage === 'readyToSolve' || stage === 'solving' || stage === 'solved') && (
            <Button onClick={handleSolveHomework} disabled={stage !== 'readyToSolve'} className="mt-4 w-full">
              {stage === 'solving' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              {t('builder.homeworkSolver.solveButton')}
            </Button>
          )}
        </CardContent>
      </Card>
    ) : (
        <Card className="min-h-[calc(100vh-250px)] flex items-center justify-center">
             <div className="text-center text-muted-foreground p-8">
                 <AlertCircle className="h-12 w-12 mb-4 mx-auto" />
            <p>{t('builder.homeworkSolver.analysisPlaceholder')}</p>
             </div>
        </Card>
    )
  );

  const solutionPanel = (
     <Card className="min-h-[calc(100vh-250px)] flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t('builder.homeworkSolver.solutionCardTitle')}</CardTitle>
            {solvedHomework && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => exportHomeworkAsDocx(analyzedHomework!, solvedHomework, 'modern')}>
                           <FileDown className="mr-2 h-4 w-4" /> Export as DOCX
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportHomeworkAsPdf(analyzedHomework!, solvedHomework)}>
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
        <CardDescription>{t('builder.homeworkSolver.solutionCardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {isProcessing && stage === 'solving' && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p>{t('builder.homeworkSolver.solvingInProgress')}</p>
          </div>
        )}
        {solvedHomework ? (
          <ScrollArea className="h-[calc(100vh-350px)] p-1">
            <ReactMarkdown components={markdownComponents}>{solvedHomework.solution}</ReactMarkdown>
          </ScrollArea>
        ) : stage !== 'solving' && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-4" />
              <p>{t('builder.homeworkSolver.solutionPlaceholder')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div>
        {/* --- DESKTOP VIEW --- */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3 space-y-6">
                <Card>
                    <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5" /> {t('builder.homeworkSolver.historyTitle')}
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={clearHistory} disabled={history.length === 0} title={t('homeworkSolver.clearHistoryTooltip')}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                    <CardDescription>{t('builder.homeworkSolver.historyDescription')}</CardDescription>
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
                                    <span className="font-semibold truncate">{item.analyzedHomework.title}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(item.id), { addSuffix: true })}
                                    </span>
                                </div>
                            </Button>
                            ))}
                        </div>
                        ) : (
                        <p className="text-sm text-muted-foreground text-center p-4">{t('homeworkSolver.historyEmpty')}</p>
                        )}
                    </ScrollArea>
                    </CardContent>
                </Card>
                <Card>
                <CardHeader>
                    <CardTitle>{t('builder.homeworkSolver.uploadCardTitle')}</CardTitle>
                    <CardDescription>{t('builder.homeworkSolver.uploadCardDescription')}</CardDescription>
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
                        {t('builder.homeworkSolver.uploadAndAnalyzeButton')}
                    </Button>
                    </div>
                </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-4">
                {analysisPanel}
            </div>
            <div className="lg:col-span-5">
                {solutionPanel}
            </div>
        </div>

        {/* --- MOBILE VIEW --- */}
        <div className="block lg:hidden col-span-1">
            <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="homework">Homework</TabsTrigger>
                    <TabsTrigger value="solution">Solution</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="mt-4">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center gap-2">
                                <History className="w-5 h-5" /> {t('builder.homeworkSolver.historyTitle')}
                                </CardTitle>
                                <Button variant="ghost" size="icon" onClick={clearHistory} disabled={history.length === 0} title={t('homeworkSolver.clearHistoryTooltip')}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <CardDescription>{t('builder.homeworkSolver.historyDescription')}</CardDescription>
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
                                            <span className="font-semibold truncate">{item.analyzedHomework.title}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(item.id), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </Button>
                                    ))}
                                </div>
                                ) : (
                                <p className="text-sm text-muted-foreground text-center p-4">{t('homeworkSolver.historyEmpty')}</p>
                                )}
                            </ScrollArea>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('builder.homeworkSolver.uploadCardTitle')}</CardTitle>
                                <CardDescription>{t('builder.homeworkSolver.uploadCardDescription')}</CardDescription>
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
                                        {t('builder.homeworkSolver.uploadAndAnalyzeButton')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="homework" className="mt-4">
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

