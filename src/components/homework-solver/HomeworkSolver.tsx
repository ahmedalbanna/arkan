
'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, Wand2, History, Trash2, Download, FileDown, BookCopy, BrainCircuit, CheckSquare, Image as ImageIcon, FileText, X, Save } from 'lucide-react';
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
import { exportHomeworkAsDocx } from '@/lib/homework-exporter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { HomeworkHistoryEntry, saveHomeworkHistory, fetchHomeworkHistory, clearHomeworkHistory } from '@/services/homework-service';
import { homeworkKeys } from '@/lib/query-keys';


// API call to analyze the homework
async function analyzeHomeworkApi(variables: { homeworkImageUris: string[], curriculumContext: string, token: string }): Promise<AnalyzedHomework> {
  const response = await fetch('/api/homework-solver/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${variables.token}` },
    body: JSON.stringify({ 
      homeworkImageUris: variables.homeworkImageUris,
      curriculumContext: variables.curriculumContext
     }),
  });
  if (!response.ok) throw new Error((await response.json()).message || 'Homework analysis failed.');
  return response.json();
}

// API call to solve the homework
async function solveHomeworkApi(variables: { analyzedHomework: AnalyzedHomework, curriculumContext: string, token: string }): Promise<SolvedHomework> {
  const response = await fetch('/api/homework-solver/solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${variables.token}` },
    body: JSON.stringify({
      analyzedHomework: variables.analyzedHomework,
      curriculumContext: variables.curriculumContext,
      targetLang: 'Arabic', // Hardcoding to Arabic as per the implicit request
    }),
  });
  if (!response.ok) throw new Error((await response.json()).message || 'Homework solving failed.');
  return response.json();
}

async function processCurriculumPdfs(variables: { files: File[], token: string }): Promise<string> {
    const formData = new FormData();
    // Since the API only accepts one file, we send them one by one and combine results.
    // A better implementation would be to modify the API to accept multiple files.
    let combinedMarkdown = "";
    for (const file of variables.files) {
        formData.set('file', file);
        const response = await fetch('/api/pdf-to-markdown', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${variables.token}` },
            body: formData,
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Processing failed for ${file.name}.`);
        }
        const result = await response.json();
        combinedMarkdown += result.markdown + "\n\n---\n\n";
    }
    return combinedMarkdown;
}


export default function HomeworkSolver() {
  const { t } = useLocalization();
  const { toast } = useToast();
  const { firebaseUser, refetchUser } = useAuth();
  
  const {
    analyzedHomework,
    solvedHomework,
    curriculumContext,
    homeworkFiles,
    curriculumFiles,
    setAnalyzedHomework,
    setSolvedHomework,
    setCurriculumContext,
    setHomeworkFiles,
    setCurriculumFiles,
    removeHomeworkFile,
    removeCurriculumFile,
    loadFromHistory,
    currentHistoryId,
    resetCurrent,
  } = useHomeworkSolverStore();
  
  const { data: history = [], refetch: refetchHistory } = useQuery<HomeworkHistoryEntry[]>({
    queryKey: homeworkKeys.history(firebaseUser?.uid),
    queryFn: async () => {
        if (!firebaseUser) return [];
        const token = await firebaseUser.getIdToken();
        return fetchHomeworkHistory(token);
    },
    enabled: !!firebaseUser
  });

  const analyzeMutation = useMutation({ 
    mutationFn: analyzeHomeworkApi,
    onSuccess: (data) => {
      setAnalyzedHomework(data);
      refetchUser();
      toast({ title: t('builder.homeworkSolver.toasts.analysisSuccess') });
    },
    onError: (error: any) => {
      toast({ title: t('builder.homeworkSolver.toasts.errorTitle'), description: error.message, variant: 'destructive' });
    }
  });

  const solveMutation = useMutation({ 
    mutationFn: solveHomeworkApi,
    onSuccess: (data) => {
        setSolvedHomework(data);
        refetchUser();
        toast({ title: t('builder.homeworkSolver.toasts.solvingSuccess') });
    },
    onError: (error: any) => {
        toast({ title: t('builder.homeworkSolver.toasts.errorTitle'), description: error.message, variant: 'destructive' });
    }
  });
  const saveHistoryMutation = useMutation({ mutationFn: saveHomeworkHistory, 
    onSuccess: () => {
        toast({ title: 'Session Saved', description: 'Your homework session has been saved to your history.' });
        refetchHistory();
    },
    onError: (error: Error) => {
        toast({ title: 'Error Saving Session', description: error.message, variant: 'destructive' });
    }
  });
  const clearHistoryMutation = useMutation({ mutationFn: clearHomeworkHistory, 
    onSuccess: () => {
        toast({ title: 'History Cleared' });
        refetchHistory();
        resetCurrent();
    },
    onError: (error: Error) => {
        toast({ title: 'Error Clearing History', description: error.message, variant: 'destructive' });
    }
  });

  const handleHomeworkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHomeworkFiles(e.target.files);
  };
  
  const handleCurriculumFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurriculumFiles(e.target.files);
  };

  const handleAnalyzeHomework = async () => {
    if (homeworkFiles.length === 0 || curriculumFiles.length === 0 || !firebaseUser) {
      toast({ title: "Missing Files or Auth", description: "Please upload homework images, curriculum PDFs, and ensure you are logged in.", variant: 'destructive' });
      return;
    }
    const token = await firebaseUser.getIdToken();

    try {
        const curriculumBlobs = await Promise.all(curriculumFiles.map(f => fetch(f.dataUrl).then(res => res.blob())));
        const curriculumFileObjects = curriculumBlobs.map((blob, i) => new File([blob], curriculumFiles[i].name, { type: curriculumFiles[i].type }));
        const curriculumText = await processCurriculumPdfs({ files: curriculumFileObjects, token });
        setCurriculumContext(curriculumText);
        refetchUser();

        await analyzeMutation.mutateAsync({ 
            homeworkImageUris: homeworkFiles.map(f => f.dataUrl), 
            curriculumContext: curriculumText,
            token 
        });
        
    } catch (error: any) {
      toast({ title: t('builder.homeworkSolver.toasts.errorTitle'), description: error.message, variant: 'destructive' });
    }
  };

  const handleSolveHomework = async () => {
    if (!analyzedHomework || !curriculumContext || !firebaseUser) {
      toast({ title: t('builder.homeworkSolver.toasts.analysisMissing'), variant: 'destructive' });
        return;
    }
    const token = await firebaseUser.getIdToken();
    solveMutation.mutate({ analyzedHomework, curriculumContext, token });
  };

  const handleSaveToHistory = async () => {
    if (!analyzedHomework || !solvedHomework || !firebaseUser) {
        toast({ title: 'Cannot Save', description: 'You must have an analyzed and solved homework to save it.', variant: 'destructive' });
        return;
    }
    const token = await firebaseUser.getIdToken();

    const homeworkFileObjects = await Promise.all(homeworkFiles.map(f => fetch(f.dataUrl).then(res => res.blob()).then(blob => new File([blob], f.name, { type: f.type }))));
    const curriculumFileObjects = await Promise.all(curriculumFiles.map(f => fetch(f.dataUrl).then(res => res.blob()).then(blob => new File([blob], f.name, { type: f.type }))));

    const formData = new FormData();
    formData.append('analyzedHomework', JSON.stringify(analyzedHomework));
    formData.append('solvedHomework', JSON.stringify(solvedHomework));
    homeworkFileObjects.forEach(file => formData.append('homeworkFiles', file));
    curriculumFileObjects.forEach(file => formData.append('curriculumFiles', file));
    
    saveHistoryMutation.mutate({ formData, token });
  };
  
  const handleClearHistory = async () => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    clearHistoryMutation.mutate({ token });
  }

  const isProcessing = analyzeMutation.isPending || solveMutation.isPending;

  const controlAndHistoryPanel = (
    <div className="space-y-6">
        <Card>
            <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" /> {t('builder.homeworkSolver.historyTitle')}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={handleClearHistory} disabled={history.length === 0 || clearHistoryMutation.isPending} title={t('homeworkSolver.clearHistoryTooltip')}>
                    {clearHistoryMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />}
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
                        onClick={() => loadFromHistory(item)}
                        className={cn(
                            "w-full h-auto justify-start text-left p-2",
                            currentHistoryId === item.id && "bg-muted"
                        )}
                    >
                        <div className="flex flex-col overflow-hidden">
                            <span className="font-semibold truncate">{item.analyzedHomework.title}</span>
                            <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
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
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="homework-file">Homework File(s) (Images/PDF)</Label>
                    <Input id="homework-file" type="file" accept="image/*,.pdf" onChange={handleHomeworkFileChange} disabled={isProcessing} multiple className="text-xs" />
                     <ScrollArea className="h-24 w-full rounded-md border p-2">
                        {homeworkFiles.map((file, index) => (
                           <Badge key={index} variant="secondary" className="mr-1 mb-1">
                               {file.name}
                               <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={() => removeHomeworkFile(index)}><X className="h-3 w-3"/></Button>
                           </Badge>
                        ))}
                     </ScrollArea>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="curriculum-file">Curriculum File(s) (Images/PDF)</Label>
                    <Input id="curriculum-file" type="file" accept="image/*,.pdf" onChange={handleCurriculumFileChange} disabled={isProcessing} multiple className="text-xs" />
                     <ScrollArea className="h-24 w-full rounded-md border p-2">
                        {curriculumFiles.map((file, index) => (
                           <Badge key={index} variant="secondary" className="mr-1 mb-1">
                               {file.name}
                               <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={() => removeCurriculumFile(index)}><X className="h-3 w-3"/></Button>
                           </Badge>
                        ))}
                     </ScrollArea>
                </div>
                <Button onClick={handleAnalyzeHomework} disabled={homeworkFiles.length === 0 || curriculumFiles.length === 0 || isProcessing} className="w-full">
                    {analyzeMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Analyze
                </Button>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                 <Button 
                    onClick={handleSaveToHistory} 
                    variant="secondary" 
                    className="w-full"
                    disabled={!analyzedHomework || !solvedHomework || saveHistoryMutation.isPending}
                 >
                    {saveHistoryMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Session
                </Button>
                 <Button onClick={resetCurrent} variant="outline" className="w-full">New Homework</Button>
            </CardFooter>
        </Card>
    </div>
  )

  const contentPanel = (
     <Card className="min-h-[calc(100vh-250px)] flex flex-col">
       <Tabs defaultValue="analysis" className="w-full flex flex-col flex-grow">
          <CardHeader>
             <div className="flex justify-between items-start">
                  <div>
                      <CardTitle>{analyzedHomework ? analyzedHomework.subject : "Homework"}</CardTitle>
                      <CardDescription>{analyzedHomework ? analyzedHomework.title : "Upload files and analyze to begin"}</CardDescription>
                  </div>
                   <TabsList>
                      <TabsTrigger value="analysis">Analysis</TabsTrigger>
                      <TabsTrigger value="solution" disabled={!solvedHomework && !solveMutation.isPending}>Solution</TabsTrigger>
                  </TabsList>
             </div>
          </CardHeader>
          <TabsContent value="analysis" className="flex-grow">
             <CardContent>
                 <ScrollArea className="h-[calc(100vh-350px)] p-1">
                      {analyzeMutation.isPending ? (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                              <Loader2 className="h-12 w-12 animate-spin mb-4" />
                              <p>Analyzing homework and curriculum...</p>
                          </div>
                      ) : analyzedHomework ? (
                          <ReactMarkdown components={markdownComponents}>{analyzedHomework.structuredQuestions}</ReactMarkdown> 
                      ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground p-8">
                              <BrainCircuit className="h-12 w-12 mb-4" />
                              <p>Analyzed homework questions will appear here.</p>
                          </div>
                      )}
                  </ScrollArea>
             </CardContent>
             <CardFooter>
                 {(analyzedHomework || solveMutation.isPending || solvedHomework) && (
                      <Button onClick={handleSolveHomework} disabled={solveMutation.isPending || !!solvedHomework} className="w-full">
                          {solveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                          {t('builder.homeworkSolver.solveButton')}
                      </Button>
                  )}
             </CardFooter>
          </TabsContent>
           <TabsContent value="solution" className="flex-grow">
              <CardContent>
                  <ScrollArea className="h-[calc(100vh-350px)] p-1">
                       {solveMutation.isPending ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                          <Loader2 className="h-12 w-12 animate-spin mb-4" />
                          <p>{t('builder.homeworkSolver.solvingInProgress')}</p>
                        </div>
                      ) : solvedHomework && Array.isArray(solvedHomework.solutions) ? (
                        <div className="prose dark:prose-invert max-w-none space-y-6">
                          {solvedHomework.solutions.map((pair, index) => (
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
                            <p>{t('builder.homeworkSolver.solutionPlaceholder')}</p>
                        </div>
                      )}
                  </ScrollArea>
              </CardContent>
               <CardFooter>
                  {solvedHomework && (
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full">
                                  <Download className="mr-2 h-4 w-4" /> Download
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => exportHomeworkAsDocx(analyzedHomework!, solvedHomework!, 'modern')}>
                                <FileDown className="mr-2 h-4 w-4" /> Export as DOCX
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                  )}
               </CardFooter>
           </TabsContent>
       </Tabs>
     </Card>
  )


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-3">
        {controlAndHistoryPanel}
      </div>
      <div className="lg:col-span-9">
        {contentPanel}
      </div>
    </div>
  );
}
