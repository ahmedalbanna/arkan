
'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool } from './use-writing-tool';
import { useToast } from '@/hooks/util/use-toast';
import { useAuth } from '@/context/AuthContext';
import { DocumentProcessingApiClient } from '@/modules/ai-content/adapters/api-client/DocumentProcessingApiClient';
import { container } from '@/infrastructure/di/container';
import { useDropzone } from 'react-dropzone';
import { useLocalization } from '@/context/LocalizationContext';

const detectorSchema = z.object({
  text: z.string().min(50, 'Please enter at least 50 characters for an accurate analysis.'),
});

type DetectorFormValues = z.infer<typeof detectorSchema>;

export function useAIDetectorLogic() {
  const { t } = useLocalization();
  const [isUploading, setIsUploading] = useState(false);
  const { user, refetchUser } = useAuth();
  const { toast } = useToast();

  const mutation = useWritingTool('ai-detector');

  const form = useForm<DetectorFormValues>({
    resolver: zodResolver(detectorSchema),
    defaultValues: { text: '' },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!user) {
      toast({ title: t('writingTools.aiDetector.toastAuthError'), variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const client = container.resolve(DocumentProcessingApiClient);
      const result = await client.processFileApi(formData);
      if (result.isFailure) throw result.error;
      const data = result.getValue();
      form.setValue('text', data.markdown || data.text, { shouldValidate: true });
      toast({ title: t('writingTools.aiDetector.toastFileProcessed'), description: t('writingTools.aiDetector.toastFileExtracted', { fileName: file.name }) });
      refetchUser();
    } catch (error: any) {
      toast({ title: t('writingTools.aiDetector.toastFileFailed'), description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  }, [user, form, refetchUser, toast, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
  });

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
    getRootProps,
    getInputProps,
    isDragActive,
    onSubmit,
    getScoreColor,
    results,
  };
}
