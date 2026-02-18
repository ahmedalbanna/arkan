
'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { useSession } from "next-auth/react";
import { processFileApi } from '@/services';
import { useDropzone } from 'react-dropzone';
import { useLocalization } from '@/context/LocalizationContext';
import { useAuth } from '@/context/NextAuthContext';

const summarizerSchema = z.object({
  text: z.string().min(20, 'Please enter at least 20 characters to summarize.'),
  length: z.enum(['short', 'medium', 'long']),
});

type SummarizerFormValues = z.infer<typeof summarizerSchema>;

export function useSummarizerLogic() {
  const { t } = useLocalization();
  const [summarizedText, setSummarizedText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const { data: session } = useSession(); const { refetchUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const summarizeMutation = useWritingTool('/api/writing-tools/summarize', {
    onSuccess: (data: any) => {
      setSummarizedText(data.summary);
      toast({ title: t('writingTools.summarizer.successToast') });
    },
    onError: (error) => {
      toast({ title: t('writingTools.summarizer.errorToast'), description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<SummarizerFormValues>({
    resolver: zodResolver(summarizerSchema),
    defaultValues: { text: '', length: 'medium' },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!session?.user?.id) {
      toast({ title: "Authentication Error", description: "You must be logged in to process files.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = session.user.id;
      const result = await processFileApi(formData, token);
      form.setValue('text', result.markdown, { shouldValidate: true });
      toast({ title: t('writingTools.summarizer.processingFile'), description: `Text extracted from ${file.name}.` });
      refetchUser();
    } catch (error: any) {
      toast({ title: "File Processing Failed", description: error.message, variant: "destructive" });
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

  const onSubmit = (data: SummarizerFormValues) => {
    summarizeMutation.mutate(data);
  };

  const handleCopy = () => {
    if (!summarizedText) return;
    navigator.clipboard.writeText(summarizedText).then(() => {
      setIsCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return {
    t,
    form,
    summarizeMutation,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    onSubmit,
    summarizedText,
    isCopied,
    handleCopy,
  };
}
