
'use client';

import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { processFileApi } from '@/services';
import { useDropzone } from 'react-dropzone';
import { useLocalization } from '@/context/LocalizationContext';
import { ParaphraseModeSchema } from '@/ai/schemas';

const paraphraserSchema = z.object({
  text: z.string().min(10, 'Please enter at least 10 characters to paraphrase.'),
  mode: ParaphraseModeSchema,
});

type ParaphraserFormValues = z.infer<typeof paraphraserSchema>;

export function useParaphraserLogic() {
  const { t } = useLocalization();
  const [originalText, setOriginalText] = useState('');
  const [paraphrasedText, setParaphrasedText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const { firebaseUser, refetchUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const paraphraseMutation = useWritingTool('/api/writing-tools/paraphrase', {
    onSuccess: (data: any) => {
        setParaphrasedText(data.paraphrasedText);
        toast({ title: t('writingTools.paraphraser.toastSuccess') });
    },
    onError: (error) => {
        toast({ title: t('writingTools.paraphraser.toastError'), description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<ParaphraserFormValues>({
    resolver: zodResolver(paraphraserSchema),
    defaultValues: { text: '', mode: 'standard' },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!firebaseUser) {
        toast({ title: t('writingTools.paraphraser.toastAuthError'), description: t('writingTools.paraphraser.toastAuthErrorDesc'), variant: "destructive" });
        return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
        const token = await firebaseUser.getIdToken();
        const result = await processFileApi(formData, token);
        form.setValue('text', result.markdown, { shouldValidate: true });
        toast({ title: t('writingTools.paraphraser.toastFileProcessed'), description: t('writingTools.paraphraser.toastFileProcessedDesc').replace('{fileName}', file.name) });
        refetchUser();
    } catch (error: any) {
        toast({ title: t('writingTools.paraphraser.toastFileFailed'), description: error.message, variant: "destructive" });
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

  const onSubmit = (data: ParaphraserFormValues) => {
    setOriginalText(data.text);
    paraphraseMutation.mutate(data);
  };

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
