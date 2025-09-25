
'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import { useWritingTool, useToast } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { processFileApi } from '@/services';
import { useLocalization } from '@/context/LocalizationContext';
import type { AIAnalysisResult } from '@/components/writing-tools/AIDetectorTool';

const aiDetectorSchema = z.object({
  text: z.string().min(100, 'Please enter at least 100 characters for an accurate analysis.'),
});

type AIDetectorFormValues = z.infer<typeof aiDetectorSchema>;

export function useAIDetectorLogic() {
  const { t } = useLocalization();
  const mutation = useWritingTool('/api/writing-tools/ai-detector');
  const { firebaseUser, refetchUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AIDetectorFormValues>({
    resolver: zodResolver(aiDetectorSchema),
    defaultValues: { text: '' },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!firebaseUser) {
        toast({ title: "Authentication Error", description: "You must be logged in to process files.", variant: "destructive" });
        return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
        const token = await firebaseUser.getIdToken();
        const result = await processFileApi(formData, token);
        form.setValue('text', result.markdown, { shouldValidate: true });
        toast({ title: t('writingTools.aiDetector.toastFileProcessed'), description: t('writingTools.aiDetector.toastFileExtracted').replace('{fileName}', file.name) });
        refetchUser();
    } catch (error: any) {
        toast({ title: t('writingTools.aiDetector.toastFileFailed'), description: error.message, variant: "destructive" });
    } finally {
        setIsUploading(false);
    }
  }, [firebaseUser, form, refetchUser, toast, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
  });

  const onSubmit = async (data: AIDetectorFormValues) => {
    mutation.mutate({ text: data.text }, {
        onError: (error) => {
            toast({ title: t('writingTools.aiDetector.toastAnalysisFailed'), description: error.message, variant: 'destructive' });
        }
    });
  };

  const getScoreColor = (score: number) => {
    if (score > 75) return 'text-destructive';
    if (score > 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  return {
    form,
    mutation,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    onSubmit,
    getScoreColor,
    results: mutation.data as AIAnalysisResult | undefined,
  };
}

// You might need to define this type or import it if it's defined elsewhere
export interface AIAnalysisResult {
    score: number;
    analysis: string;
}
