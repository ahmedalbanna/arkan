
'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { useDropzone } from 'react-dropzone';
import { useSession } from "next-auth/react";
import { processFileApi } from '@/services';
import type { FactCheckOutput } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { useAuth } from '@/context/NextAuthContext';

const factCheckSchema = z.object({
  text: z.string().min(50, 'Please enter at least 50 characters for an accurate analysis.'),
});

type FactCheckFormValues = z.infer<typeof factCheckSchema>;

export function useFactCheckerLogic() {
  const { t } = useLocalization();
  const [isUploading, setIsUploading] = useState(false);
  const { data: session } = useSession(); const { refetchUser } = useAuth();
  const { toast } = useToast();

  const mutation = useWritingTool('/api/writing-tools/fact-checker', {
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

    if (!session?.user?.id) {
      toast({ title: t('writingTools.aiDetector.toastAuthError'), variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = session.user.id;
      const result = await processFileApi(formData, token);
      form.setValue('text', result.markdown, { shouldValidate: true });
      toast({ title: t('writingTools.aiDetector.toastFileProcessed'), description: t('writingTools.aiDetector.toastFileExtracted', { fileName: file.name }) });
      refetchUser();
    } catch (error: any) {
      toast({ title: t('writingTools.aiDetector.toastFileFailed'), description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  }, [session?.user?.id, form, refetchUser, toast, t]);

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
