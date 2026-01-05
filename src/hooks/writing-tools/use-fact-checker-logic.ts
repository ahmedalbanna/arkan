
'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/context/AuthContext';
import { processFileApi } from '@/services';
import type { FactCheckOutput } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';

const factCheckSchema = z.object({
  text: z.string().min(50, 'Please enter at least 50 characters for an accurate analysis.'),
});

type FactCheckFormValues = z.infer<typeof factCheckSchema>;

export function useFactCheckerLogic() {
  const { t } = useLocalization();
  const [isUploading, setIsUploading] = useState(false);
  const { firebaseUser, refetchUser } = useAuth();
  const { toast } = useToast();

  const mutation = useWritingTool('fact-checker', {
    onError: (error) => {
      toast({ title: t('writingTools.factChecker.checkFailedTitle'), description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<FactCheckFormValues>({
    resolver: zodResolver(factCheckSchema),
    defaultValues: { text: '' },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!firebaseUser) {
      toast({ title: t('writingTools.aiDetector.toastAuthError'), variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = await firebaseUser.getIdToken();
      const result = await processFileAction(formData);
      form.setValue('text', result.markdown, { shouldValidate: true });
      toast({ title: t('writingTools.aiDetector.toastFileProcessed'), description: t('writingTools.aiDetector.toastFileExtracted', { fileName: file.name }) });
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

  const onSubmit = (data: FactCheckFormValues) => {
    mutation.mutate(data);
  };

  const results = mutation.data as FactCheckOutput | null;

  return {
    t,
    form,
    mutation,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    onSubmit,
    results,
  };
}
