
'use client';

import type { PlagiarismCheckOutput } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useToast, useWritingTool } from '@/hooks';
import { processFileApi } from '@/services';
import { getFirebaseAuthToken } from '@/lib/utils/authUtils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const plagiarismSchema = z.object({
  text: z.string().min(50, 'Please enter at least 50 characters for an accurate analysis.'),
});

type PlagiarismFormValues = z.infer<typeof plagiarismSchema>;

export function usePlagiarismCheckerLogic() {
  const { t } = useLocalization();
  const [isUploading, setIsUploading] = useState(false);
  const { firebaseUser, refetchUser } = useAuth();
  const { toast } = useToast();

  const mutation = useWritingTool('/api/writing-tools/plagiarism-checker', {
    onError: (error) => {
      toast({ title: t('writingTools.plagiarismChecker.checkFailedTitle'), description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<PlagiarismFormValues>({
    resolver: zodResolver(plagiarismSchema),
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
      const token = await getFirebaseAuthToken();
      const result = await processFileApi(formData, token);
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

  const onSubmit = (data: PlagiarismFormValues) => {
    mutation.mutate(data);
  };

  const getScoreColor = (score: number) => {
    if (score < 50) return 'text-green-500';
    if (score < 80) return 'text-yellow-500';
    return 'text-destructive';
  };

  const results = mutation.data as PlagiarismCheckOutput | null;

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
