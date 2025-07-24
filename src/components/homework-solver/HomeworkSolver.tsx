
'use client';

import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, Wand2, History, Trash2, Download, FileDown, BookCheck, BrainCircuit, CheckSquare, Image as ImageIcon, FileText, X } from 'lucide-react';
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


// API call to analyze the homework
async function analyzeHomeworkApi(variables: { homeworkImageUris: string[], token: string }): Promise<AnalyzedHomework> {
  const response = await fetch('/api/homework-solver/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${variables.token}` },
    body: JSON.stringify({ homeworkImageUris: variables.homeworkImageUris }),
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
    stage,
    analyzedHomework,
    solvedHomework,
    curriculumContext,
    homeworkFiles,
    curriculumFiles,
    history,
    setStage,
    setAnalyzedHomework,
    setSolvedHomework,
    setCurriculumContext,
    setHomeworkFiles,
    setCurriculumFiles,
    removeHomeworkFile,
    removeCurriculumFile,
    addSolvedHomeworkToHistory,
    clearHistory,
    loadFromHistory,
    currentHistoryId,
    resetCurrent,
  } = useHomeworkSolverStore();
  
  const analyzeMutation = useMutation({ mutationFn: analyzeHomeworkApi });
  const solveMutation = useMutation({ mutationFn: solveHomeworkApi });

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
    setStage('analyzing');

    try {
        const curriculumBlobs = await Promise.all(curriculumFiles.map(f => fetch(f.dataUrl).then(res => res.blob())));
        const curriculumFileObjects = curriculumBlobs.map((blob, i) => new File([blob], curriculumFiles[i].name, { type: curriculumFiles[i].type }));
        
        // Process curriculum and homework analysis in parallel
        const [curriculumText, analysisData] = await Promise.all([
            processCurriculumPdfs({ files: curriculumFileObjects, token }),
            analyzeMutation.mutateAsync({ 
                homeworkImageUris: homeworkFiles.map(f => f.dataUrl), 
                token 
            })
        ]);
        
        refetchUser(); // Credits deducted for processing files
        setCurriculumContext(curriculumText);
        setAnalyzedHomework(analysisData);
        setStage('readyToSolve');
        toast({ title: t('builder.homeworkSolver.toasts.analysisSuccess') });
    } catch (error: any) {
      toast({ title: t('builder.homeworkSolver.toasts.errorTitle'), description: error.message, variant: 'destructive' });
      setStage('idle');
    }
  };

  const handleSolveHomework = async () => {
    if (!analyzedHomework || !curriculumContext || !firebaseUser || homeworkFiles.length === 0 || curriculumFiles.length === 0) {
      toast({ title: t('builder.homeworkSolver.toasts.analysisMissing'), variant: 'destructive' });
      return;
    }
    const token = await firebaseUser.getIdToken();
    setStage('solving');
    try {
      const solvedData = await solveMutation.mutateAsync({ analyzedHomework, curriculumContext, token });
      setSolvedHomework(solvedData);
      addSolvedHomeworkToHistory(analyzedHomework, solvedData, homeworkFiles, curriculumFiles);
      setStage('solved');
      refetchUser();
      toast({ title: t('builder.homeworkSolver.toasts.solvingSuccess') });
    } catch (error: any) {
      toast({ title: t('builder.homeworkSolver.toasts.errorTitle'), description: error.message, variant: 'destructive' });
      setStage('readyToSolve');
    }
  };
  
  const isProcessing = ['analyzing', 'solving'].includes(stage);

  const analysisPanel = (
    <Card className="h-full flex flex-col">
        <CardHeader>
            <CardTitle>{t('builder.homeworkSolver.analysisCardTitle')}</CardTitle>
            <CardDescription>{analyzedHomework ? `${analyzedHomework.subject} - ${analyzedHomework.title}` : t('builder.homeworkSolver.analysisPlaceholder')}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
            <ScrollArea className="flex-grow p-1">
                {stage === 'analyzing' ? (
                     <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Loader2 className="h-12 w-12 animate-spin mb-4" />
                        <p>Analyzing homework and curriculum...</p>
                    </div>
                ) : analyzedHomework ? (
                    <ReactMarkdown components={markdownComponents}>{analyzedHomework.structuredQuestions}</ReactMarkdown> 
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground p-8">
                        <BrainCircuit className="h-12 w-12 mb-4" />
                    </div>
                )}
            </ScrollArea>
            {(stage === 'readyToSolve' || stage === 'solving' || stage === 'solved') && (
                <Button onClick={handleSolveHomework} disabled={stage !== 'readyToSolve'} className="mt-4 w-full">
                    {stage === 'solving' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    {t('builder.homeworkSolver.solveButton')}
                </Button>
            )}
        </CardContent>
    </Card>
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
        </div>
        <CardDescription>{t('builder.homeworkSolver.solutionCardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {stage === 'solving' ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p>{t('builder.homeworkSolver.solvingInProgress')}</p>
          </div>
        ) : solvedHomework && Array.isArray(solvedHomework.solutions) ? (
          <ScrollArea className="h-[calc(100vh-350px)] p-1">
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
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <CheckSquare className="h-12 w-12 mb-4" />
              <p>{t('builder.homeworkSolver.solutionPlaceholder')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const controlAndHistoryPanel = (
    <div className="space-y-6">
        <Card>
            <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" /> {t('builder.homeworkSolver.historyTitle')}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={clearHistory} disabled={history.length === 0} title={t('homeworkSolver.clearHistoryTooltip')}>
                    <Trash2 className="w-4 w-4" />
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
                        <div className="flex flex-col overflow-hidden">
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
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="homework-file">Homework File(s) (Images)</Label>
                    <Input id="homework-file" type="file" accept="image/*" onChange={handleHomeworkFileChange} disabled={isProcessing} multiple className="text-xs" />
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
                    <Label htmlFor="curriculum-file">Curriculum File(s) (PDF)</Label>
                    <Input id="curriculum-file" type="file" accept=".pdf" onChange={handleCurriculumFileChange} disabled={isProcessing} multiple className="text-xs" />
                     <ScrollArea className="h-24 w-full rounded-md border p-2">
                        {curriculumFiles.map((file, index) => (
                           <Badge key={index} variant="secondary" className="mr-1 mb-1">
                               {file.name}
                               <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={() => removeCurriculumFile(index)}><X className="h-3 w-3"/></Button>
                           </Badge>
                        ))}
                     </ScrollArea>
                </div>
                <Button onClick={handleAnalyzeHomework} disabled={homeworkFiles.length === 0 || curriculumFiles.length === 0 || isProcessing || stage === 'solved'} className="w-full">
                    {stage === 'analyzing' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Analyze
                </Button>
            </CardContent>
            <CardFooter>
                 <Button onClick={resetCurrent} variant="outline" className="w-full">New Homework</Button>
            </CardFooter>
        </Card>
    </div>
  )

  return (
    <div>
        {/* --- DESKTOP VIEW --- */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3">
                {controlAndHistoryPanel}
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
                    <TabsTrigger value="upload">Upload & History</TabsTrigger>
                    <TabsTrigger value="exam">Exam</TabsTrigger>
                    <TabsTrigger value="solution">Solution</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="mt-4">
                    {controlAndHistoryPanel}
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
