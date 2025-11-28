'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { ParaphraseModeSchema } from '@/ai/schemas';
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
  const { toast } = useToast();

  const paraphraseMutation = useWritingTool('/api/writing-tools/paraphrase');

  const form = useForm<ParaphraserFormValues>({
    resolver: zodResolver(paraphraserSchema),
    defaultValues: { text: '', mode: 'standard' },
  });

  const onFileUpload = (fileContent: string) => {
    form.setValue('text', fileContent, { shouldValidate: true });
    toast({ title: t('writingTools.paraphraser.toastFileProcessed') });
  };

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
    setIsUploading,
    onFileUpload,
    onSubmit,
    originalText,
    paraphrasedText,
    isCopied,
    handleCopy,
  };
}
