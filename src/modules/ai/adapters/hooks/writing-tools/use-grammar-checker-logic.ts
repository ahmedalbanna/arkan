
'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import type { GrammarCheckOutput } from '@/modules/ai/domain/schemas';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/context/AuthContext';
import { DocumentProcessingApiClient } from '@/modules/ai-content/adapters/api-client/DocumentProcessingApiClient';
import { container } from '@/infrastructure/di/container';
import { useLocalization } from '@/context/LocalizationContext';

const grammarCheckSchema = z.object({
  text: z.string().min(10, 'Please enter at least 10 characters to check.'),
});

type GrammarCheckFormValues = z.infer<typeof grammarCheckSchema>;

export function useGrammarCheckerLogic() {
  const { t } = useLocalization();
  const [isUploading, setIsUploading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { user, refetchUser } = useAuth();
  const { toast } = useToast();

  const mutation = useWritingTool('/api/writing-tools/grammar-checker');

  const form = useForm<GrammarCheckFormValues>({
    resolver: zodResolver(grammarCheckSchema),
    defaultValues: { text: '' },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!user) {
      toast({ title: t('writingTools.grammarChecker.authErrorTitle'), variant: "destructive" });
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
      toast({ title: t('writingTools.grammarChecker.fileProcessed'), description: `Text extracted from ${file.name}.` });
      refetchUser();
    } catch (error: any) {
      toast({ title: t('writingTools.grammarChecker.fileProcessingFailed'), description: error.message, variant: "destructive" });
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

  const onSubmit = (data: GrammarCheckFormValues) => {
    mutation.mutate(data);
  };

  const handleCopy = () => {
    const correctedText = (mutation.data as GrammarCheckOutput)?.correctedText;
    if (!correctedText) return;
    navigator.clipboard.writeText(correctedText).then(() => {
      setIsCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const results = mutation.data as GrammarCheckOutput | null;

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
    isCopied,
    handleCopy,
  };
}
