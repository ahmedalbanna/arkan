
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { CheckCircle, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useAuth } from '@/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalization } from '@/context/LocalizationContext';
import { useReportStore } from '@/hooks/useReportStore';
import { useDiagramStore } from '@/hooks/useDiagramStore';
import { useEvaluateReport } from '@/hooks/use-evaluation';
import { processPdfToMarkdown } from '@/services/document-processing-service';

export const EvaluationTools = () => {
    const { proposal } = useBuilderStore();
    const { sections } = useReportStore();
    const { diagrams } = useDiagramStore();
    const { firebaseUser } = useAuth();
    const { t } = useLocalization();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [criteria, setCriteria] = useState('');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isProcessingPdf, setIsProcessingPdf] = useState(false);
    
    const mutation = useEvaluateReport();

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
        if (!pdfFile || !firebaseUser) {
             toast({ title: "Authentication Error", description: "You must be logged in to process a file.", variant: 'destructive' });
            return
        };
        setIsProcessingPdf(true);
        const formData = new FormData();
        formData.append('file', pdfFile);
        
        try {
            const token = await firebaseUser.getIdToken();
            const result = await processPdfToMarkdown(formData, token);
            const extractedCriteria = result.markdown
                .split('\n')
                .filter((line: string) => line.trim().startsWith('-') || /^\d+\./.test(line.trim()))
                .map((line: string) => line.trim().replace(/^(-|\d+\.)\s*/, ''))
                .join('\n');
            setCriteria(extractedCriteria);
            queryClient.invalidateQueries({ queryKey: ['user'] }); // Invalidate user to refetch credits
            toast({ title: t('builder.reportGenerator.toasts.fileProcessed'), description: t('builder.reportGenerator.toasts.fileProcessedDesc') });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsProcessingPdf(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firebaseUser) {
            toast({ title: t('builder.toasts.authError'), description: "You must be logged in to evaluate a report.", variant: 'destructive' });
            return;
        }
        if (!criteria.trim()) {
            toast({ title: t('builder.reportGenerator.toasts.evaluationSkipped'), description: t('builder.reportGenerator.toasts.evaluationSkippedDesc'), variant: 'destructive' });
            return;
        }

        const body = {
            proposal: proposal!,
            reportSections: sections,
            diagrams: Object.fromEntries(Object.entries(diagrams || {}).map(([key, value]) => [key, (value as any).plantUmlCode])),
            acceptanceCriteria: criteria.split('\n').filter(c => c.trim()),
        };
        mutation.mutate(body);
    }
  
  return (
    <form onSubmit={handleSubmit}>
        <Card className={mutation.isPending ? 'opacity-50 pointer-events-none' : ''}>
        <CardHeader>
            <CardTitle className="font-headline">{t('builder.reportGenerator.evaluationTitle')}</CardTitle>
            <CardDescription>{t('builder.reportGenerator.evaluationDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Textarea
                    name="acceptanceCriteria"
                    placeholder={t('builder.reportGenerator.criteriaPlaceholder')}
                    rows={6}
                    value={criteria}
                    onChange={(e) => setCriteria(e.target.value)}
                    disabled={mutation.isPending}
                />
            </div>
            <div className="space-y-2">
                <div className="flex gap-2">
                    <Input type="file" accept=".pdf" onChange={handleFileChange} disabled={mutation.isPending || isProcessingPdf} className="text-xs" />
                    <Button type="button" size="sm" onClick={handleProcessPdf} disabled={!pdfFile || mutation.isPending || isProcessingPdf}>
                        {isProcessingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileText className="mr-2 h-4 w-4"/>}
                        {t('builder.reportGenerator.processPdf')}
                    </Button>
                </div>
            </div>
        </CardContent>
        <CardFooter>
            <Button
                type="submit"
                disabled={mutation.isPending || !criteria}
                className="w-full font-headline"
            >
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            {t('builder.reportGenerator.evaluateReport')}
            </Button>
        </CardFooter>
        </Card>
    </form>
  );
};
