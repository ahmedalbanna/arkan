
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { CheckCircle, FileText, Frown, Loader2, Meh, Smile, Star, UploadCloud } from 'lucide-react';
import type { EvaluateReportOutput } from '@/ai/flows/evaluate-report';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '../ui/progress';

interface EvaluationToolsProps {
  isDisabled: boolean;
  isEvaluating: boolean;
  evaluationResult?: EvaluateReportOutput;
}

export const EvaluationTools = ({ isDisabled, isEvaluating, evaluationResult }: EvaluationToolsProps) => {
  const [criteria, setCriteria] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else if (file) {
      toast({ title: 'Invalid File', description: 'Please select a PDF file.', variant: 'destructive' });
      setPdfFile(null);
    }
  };

  const handleProcessPdf = async () => {
    if (!pdfFile) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', pdfFile);
    try {
      const response = await fetch('/api/pdf-to-markdown', { method: 'POST', body: formData });
      if (!response.ok) {
        throw new Error((await response.json()).message || 'Failed to process PDF.');
      }
      const result = await response.json();
      const extractedCriteria = result.markdown
        .split('\n')
        .filter((line: string) => line.trim().startsWith('-') || /^\d+\./.test(line.trim()))
        .map((line: string) => line.trim().replace(/^(-|\d+\.)\s*/, ''))
        .join('\n');
      setCriteria(extractedCriteria);
      toast({ title: 'File Processed', description: 'Criteria extracted from PDF.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };
  
  const getScoreColor = (score: number) => {
    if (score < 50) return 'text-destructive';
    if (score < 75) return 'text-yellow-500';
    return 'text-green-500';
  }
  
  const getScoreIcon = (score: number) => {
      if (score < 50) return <Frown className="h-10 w-10" />;
      if (score < 75) return <Meh className="h-10 w-10" />;
      return <Smile className="h-10 w-10" />;
  }

  return (
    <Card className={isDisabled && !isEvaluating ? 'opacity-50 pointer-events-none' : ''}>
      <CardHeader>
        <CardTitle className="font-headline">Acceptance Criteria & Evaluation</CardTitle>
        <CardDescription>Define criteria to evaluate the report's quality.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Textarea
                name="acceptanceCriteria"
                placeholder="Enter each criterion on a new line..."
                rows={6}
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                disabled={isDisabled}
            />
        </div>
        <div className="space-y-2">
            <div className="flex gap-2">
                <Input type="file" accept=".pdf" onChange={handleFileChange} disabled={isDisabled || isUploading} className="text-xs" />
                <Button type="button" size="sm" onClick={handleProcessPdf} disabled={!pdfFile || isDisabled || isUploading}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileText className="mr-2 h-4 w-4"/>}
                    Process
                </Button>
            </div>
        </div>
        
        {evaluationResult && !isEvaluating && (
          <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold">Evaluation Result</h4>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                <div className={getScoreColor(evaluationResult.evaluationScore)}>
                    {getScoreIcon(evaluationResult.evaluationScore)}
                </div>
                <div className="flex-grow">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Quality Score</span>
                        <span className={`font-bold text-lg ${getScoreColor(evaluationResult.evaluationScore)}`}>
                            {evaluationResult.evaluationScore} / 100
                        </span>
                    </div>
                    <Progress value={evaluationResult.evaluationScore} className="h-2"/>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{evaluationResult.summary}</p>
                <ul className="space-y-1 text-xs list-disc pl-4">
                    {evaluationResult.feedback.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
              </div>
          </div>
        )}
        
      </CardContent>
      <CardFooter>
        <Button
            type="submit"
            name="itemToGenerate"
            value="evaluate"
            disabled={isDisabled || !criteria}
            className="w-full font-headline"
        >
          {isEvaluating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
          Evaluate Report
        </Button>
      </CardFooter>
    </Card>
  );
};
