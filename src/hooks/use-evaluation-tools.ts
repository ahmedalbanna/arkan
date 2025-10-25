
'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useLocalization } from '@/context/LocalizationContext';
import { useToast } from '@/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useBuilderStore } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useEvaluateReport } from '@/hooks';
import { processFileApi } from '@/services';
import type { AnyProjectProposal } from '@/ai/schemas';

export const useEvaluationTools = () => {
    const { project } = useBuilderStore();
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
            return;
        }
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
            queryClient.invalidateQueries({ queryKey: ['user'] });
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

        const body = {
            reportSections: project?.sections || {},
            diagrams: Object.fromEntries(Object.entries(project?.diagrams || {}).map(([key, value]) => [key, (value as any).plantUmlCode])),
            acceptanceCriteria: criteria.split('\n').filter(c => c.trim()),
        };
        mutation.mutate(body as any);
    };

    return {
        t,
        criteria,
        setCriteria,
        pdfFile,
        isProcessingPdf,
        mutation,
        handleFileChange,
        handleProcessPdf,
        handleSubmit,
    };
};
