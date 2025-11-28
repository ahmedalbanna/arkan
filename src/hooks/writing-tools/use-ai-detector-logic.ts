'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks/util';
import { useLocalization } from '@/context/LocalizationContext';

const detectorSchema = z.object({
  text: z.string().min(50, 'Please enter at least 50 characters for an accurate analysis.'),
});

type DetectorFormValues = z.infer<typeof detectorSchema>;

export function useAIDetectorLogic() {
  const { t } = useLocalization();
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const mutation = useWritingTool('/api/writing-tools/ai-detector');

  const form = useForm<DetectorFormValues>({
    resolver: zodResolver(detectorSchema),
    defaultValues: { text: '' },
  });

  const onFileUpload = (fileContent: string) => {
    form.setValue('text', fileContent, { shouldValidate: true });
    toast({ title: t('writingTools.aiDetector.toastFileProcessed') });
  };

  const onSubmit = (data: DetectorFormValues) => {
    mutation.mutate(data, {
        onError: (error) => {
            toast({ title: t('writingTools.aiDetector.toastAnalysisFailed'), description: error.message, variant: "destructive" });
        }
    });
  };

  const getScoreColor = (score: number) => {
    if (score > 80) return 'text-destructive';
    if (score > 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  const results = mutation.data as { score: number; analysis: string } | null;

  return {
    t,
    form,
    mutation,
    isUploading,
    setIsUploading,
    onFileUpload,
    onSubmit,
    getScoreColor,
    results,
  };
}
