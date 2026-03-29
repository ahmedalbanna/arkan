
'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { ParaphraseModeSchema } from '@/modules/ai/domain/schemas';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/context/AuthContext';
import { DocumentProcessingApiClient } from '@/modules/ai-content/adapters/api-client/DocumentProcessingApiClient';
import { container } from '@/infrastructure/di/container';
import { useLocalization } from '@/context/LocalizationContext';

const paraphraserSchema = z.object({
  text: z.string().min(10, 'Please enter at least 10 characters to paraphrase.'),
  mode: ParaphraseModeSchema,
});

type ParaphraserFormValues = z.infer<typeof paraphraserSchema>;

export function useParaphraserLogic() {
  const { t } = useLocalization();
  const [isCopied, setIsCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { user, refetchUser } = useAuth();
  const { toast } = useToast();

  const paraphraseMutation = useWritingTool('paraphrase');

  const form = useForm<ParaphraserFormValues>({
    resolver: zodResolver(paraphraserSchema),
    defaultValues: { text: '', mode: 'standard' },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!user) {
      toast({ title: t('writingTools.paraphraser.toastAuthError'), description: t('writingTools.paraphraser.toastAuthErrorDesc'), variant: "destructive" });
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
      toast({ title: t('writingTools.paraphraser.toastFileProcessed'), description: t('writingTools.paraphraser.toastFileProcessedDesc', { fileName: file.name }) });
      refetchUser();
    } catch (error: any) {
      toast({ title: t('writingTools.paraphraser.toastFileFailed'), description: error.message, variant: "destructive" });
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

  const onSubmit = (data: ParaphraserFormValues) => {
    paraphraseMutation.mutate(data, {
      onSuccess: () => {
        toast({ title: t('writingTools.paraphraser.toastSuccess') });
      },
      onError: (error) => {
        toast({ title: t('writingTools.paraphraser.toastError'), description: error.message, variant: 'destructive' });
      },
    });
  };

  const originalText = form.watch('text');
  const paraphrasedText = (paraphraseMutation.data as { paraphrasedText: string } | null)?.paraphrasedText || '';

  const handleCopy = () => {
    if (!paraphrasedText) return;
    navigator.clipboard.writeText(paraphrasedText).then(() => {
      setIsCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return {
    t,
    form,
    paraphraseMutation,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    onSubmit,
    originalText,
    paraphrasedText,
    isCopied,
    handleCopy,
  };
}
