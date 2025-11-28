'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import type { PlagiarismCheckOutput } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';

const plagiarismSchema = z.object({
  text: z.string().min(50, 'Please enter at least 50 characters for an accurate analysis.'),
});

type PlagiarismFormValues = z.infer<typeof plagiarismSchema>;

export function usePlagiarismCheckerLogic() {
  const { t } = useLocalization();
  const [isUploading, setIsUploading] = useState(false);
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

  const onFileUpload = (fileContent: string) => {
    form.setValue('text', fileContent, { shouldValidate: true });
    toast({ title: t('writingTools.plagiarismChecker.toastFileProcessed') });
  };

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
    setIsUploading,
    onFileUpload,
    onSubmit,
    getScoreColor,
    results,
  };
}
