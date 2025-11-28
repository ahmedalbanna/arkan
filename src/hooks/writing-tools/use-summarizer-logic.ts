'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';

const summarizerSchema = z.object({
  text: z.string().min(20, 'Please enter at least 20 characters to summarize.'),
  length: z.enum(['short', 'medium', 'long']),
});

type SummarizerFormValues = z.infer<typeof summarizerSchema>;

export function useSummarizerLogic() {
  const { t } = useLocalization();
  const [summarizedText, setSummarizedText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
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

  const onFileUpload = (fileContent: string) => {
    form.setValue('text', fileContent, { shouldValidate: true });
    toast({ title: t('writingTools.summarizer.processingFile') });
  };

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
    setIsUploading,
    onFileUpload,
    onSubmit,
    summarizedText,
    isCopied,
    handleCopy,
  };
}
