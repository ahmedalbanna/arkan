
'use client';

import { z } from 'zod';
import { useState } from 'react';
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
import { processFileApi } from '@/services/document-processing-service'; // Keep this import

const ProposalPayloadSchema = z.object({
 projectPlan: z.object({
 timeline: z.string().default(''),
 keyDeliverables: z.string().default(''),
 }).optional(),
 category: z.string().default(''),
 title: z.string().default(''),
 executiveSummary: z.string().default(''),
 problemStatement: z.string().default(''),
 proposedSolution: z.object({
 overview: z.string().default(''),
 technicalApproach: z.string().default(''),
 keyFeatures: z.string().default(''),
 }).default({ overview: '', technicalApproach: '', keyFeatures: '' }),
 budgetBreakdown: z.string().default(''),
 // Add other fields that might be present in your actual proposal type
 // and provide default values or make them optional as needed.
 // For example:
 // evaluation: z.string().optional(),
});

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
            toast({ title: t('builder.toasts.invalidFile'), description: t('builder.reportGenerator.toasts.pdfOnly'), variant: 'destructive' });
            setPdfFile(null);
        }
    };

    const handleProcessPdf = async () => {
        if (!pdfFile || !firebaseUser) {
             toast({ title: t('builder.toasts.authError'), description: t('builder.reportGenerator.toasts.loginToProcess'), variant: 'destructive' });
            return
        };
        setIsProcessingPdf(true);
        const formData = new FormData();
        formData.append('file', pdfFile);

        try {
            const token = await firebaseUser.getIdToken();
            const result = await processFileApi(formData, token);
            const extractedCriteria = result.markdown
                .split('\n')
                .filter((line: string) => line.trim().startsWith('-') || /^\d+\./.test(line.trim()))
                .map((line: string) => line.trim().replace(/^(-|\d+\.)\s*/, ''))
                .join('\n');
            setCriteria(extractedCriteria);
            queryClient.invalidateQueries({ queryKey: ['user'] }); // Invalidate user to refetch credits
            toast({ title: t('builder.reportGenerator.toasts.fileProcessed'), description: t('builder.reportGenerator.toasts.fileProcessedDesc') });
        } catch (error: any) {
            toast({ title: t('builder.toasts.errorTitle'), description: error.message, variant: 'destructive' });
        } finally {
            setIsProcessingPdf(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firebaseUser) {
            toast({ title: t('builder.toasts.authError'), description: t('builder.reportGenerator.toasts.loginToEvaluate'), variant: 'destructive' });
            return;
        }
        if (!criteria.trim()) {
            toast({ title: t('builder.reportGenerator.toasts.evaluationSkipped'), description: t('builder.reportGenerator.toasts.evaluationSkippedDesc'), variant: 'destructive' });
            return;
        }

        try {
            // Safely parse and structure the proposal data using the schema.
            // This handles null/undefined values and ensures a consistent shape.
            const safeProposal = ProposalPayloadSchema.parse(proposal || {});

            const body = {
                proposal: safeProposal,
                reportSections: sections,
                diagrams: Object.fromEntries(Object.entries(diagrams || {}).map(([key, value]) => [key, (value as any).plantUmlCode])),
                acceptanceCriteria: criteria.split('\n').filter(c => c.trim()),
            };
            mutation.mutate(body);
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error("Proposal data validation failed:", error.flatten());
                toast({ title: "Invalid Data", description: "The proposal data is not in the correct format.", variant: 'destructive' });
            }
        }
    }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <Textarea
                name="acceptanceCriteria"
                placeholder={t('builder.reportGenerator.criteriaPlaceholder')}
                rows={6}
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                disabled={mutation.isPending}
            />
        </div>
        <div className="flex gap-2">
            <Input type="file" accept=".pdf" onChange={handleFileChange} disabled={mutation.isPending || isProcessingPdf} className="text-xs" />
            <Button type="button" size="sm" onClick={handleProcessPdf} disabled={!pdfFile || mutation.isPending || isProcessingPdf}>
                {isProcessingPdf ? <Loader2 className="me-2 h-4 w-4 animate-spin"/> : <FileText className="me-2 h-4 w-4"/>}
                {t('builder.reportGenerator.processPdf')}
            </Button>
        </div>
         <Button
            type="submit"
            disabled={mutation.isPending || !criteria}
            className="w-full font-headline"
        >
        {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <CheckCircle className="me-2 h-4 w-4" />}
        {t('builder.reportGenerator.evaluateReport')}
        </Button>
    </form>
  );
};
