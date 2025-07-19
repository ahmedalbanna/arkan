
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, UploadCloud, AlertCircle, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AnalyzedExam, SolvedExam } from '@/ai/flows/exam-solver';

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

  const [stage, setStage] = useState<ExamSolverStage>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [analyzedExam, setAnalyzedExam] = useState<AnalyzedExam | null>(null);
  const [solvedExam, setSolvedExam] = useState<SolvedExam | null>(null);

  const parseMutation = useMutation({ mutationFn: (vars: { formData: FormData, token: string }) => parsePdf(vars.formData, vars.token) });
  const analyzeMutation = useMutation({ mutationFn: (vars: { markdown: string, token: string }) => analyzeExam(vars.markdown, vars.token) });
  const solveMutation = useMutation({ mutationFn: (vars: { analyzedExam: AnalyzedExam, token: string }) => solveExam(vars.analyzedExam, vars.token) });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast({ title: t('examSolver.toasts.invalidFile'), variant: 'destructive' });
      setFile(null);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file || !firebaseUser) {
      toast({ title: t('examSolver.toasts.authError'), variant: 'destructive' });
      return;
    }
    const token = await firebaseUser.getIdToken();

    // Step 1: Parse PDF
    setStage('parsing');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const parsedData = await parseMutation.mutateAsync({ formData, token });
      refetchUser(); // Update credits after successful parsing

      // Step 2: Analyze Exam
      setStage('analyzing');
      const analysisData = await analyzeMutation.mutateAsync({ markdown: parsedData.markdown, token });
      setAnalyzedExam(analysisData);
      setStage('readyToSolve');
      refetchUser(); // Update credits after successful analysis
      toast({ title: t('examSolver.toasts.analysisSuccess') });
    } catch (error: any) {
      toast({ title: t('examSolver.toasts.errorTitle'), description: error.message, variant: 'destructive' });
      setStage('idle');
    }
  };

  const handleSolveExam = async () => {
    if (!analyzedExam || !firebaseUser) {
        toast({ title: t('examSolver.toasts.analysisMissing'), variant: 'destructive' });
        return;
    }
    const token = await firebaseUser.getIdToken();
    setStage('solving');
    try {
      const solvedData = await solveMutation.mutateAsync({ analyzedExam, token });
      setSolvedExam(solvedData);
      setStage('solved');
      refetchUser(); // Update credits after solving
      toast({ title: t('examSolver.toasts.solvingSuccess') });
    } catch (error: any) {
      toast({ title: t('examSolver.toasts.errorTitle'), description: error.message, variant: 'destructive' });
      setStage('readyToSolve');
    }
  };

  const isProcessing = ['parsing', 'analyzing', 'solving'].includes(stage);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Column */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('examSolver.uploadCardTitle')}</CardTitle>
            <CardDescription>{t('examSolver.uploadCardDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input type="file" accept=".pdf" onChange={handleFileChange} disabled={isProcessing} />
              <Button onClick={handleUploadAndAnalyze} disabled={!file || isProcessing}>
                {stage === 'parsing' || stage === 'analyzing' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="mr-2 h-4 w-4" />
                )}
                {t('examSolver.uploadAndAnalyzeButton')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {analyzedExam && (
          <Card>
            <CardHeader>
              <CardTitle>{t('examSolver.analysisCardTitle')}</CardTitle>
              <CardDescription>{t('examSolver.analysisCardDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] p-1">
                <ReactMarkdown components={markdownComponents}>{analyzedExam.structuredExam}</ReactMarkdown>
              </ScrollArea>
              {(stage === 'readyToSolve' || stage === 'solving' || stage === 'solved') && (
                <Button onClick={handleSolveExam} disabled={stage !== 'readyToSolve'} className="mt-4 w-full">
                  {stage === 'solving' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  {t('examSolver.solveButton')}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column */}
      <div>
        <Card className="min-h-[calc(100vh-250px)]">
          <CardHeader>
            <CardTitle>{t('examSolver.solutionCardTitle')}</CardTitle>
            <CardDescription>{t('examSolver.solutionCardDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isProcessing && stage === 'solving' && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin mb-4" />
                <p>{t('examSolver.solvingInProgress')}</p>
              </div>
            )}
            {solvedExam ? (
              <ScrollArea className="h-[calc(100vh-350px)] p-1">
                <ReactMarkdown components={markdownComponents}>{solvedExam.solution}</ReactMarkdown>
              </ScrollArea>
            ) : stage !== 'solving' && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-4" />
                <p>{t('examSolver.solutionPlaceholder')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
