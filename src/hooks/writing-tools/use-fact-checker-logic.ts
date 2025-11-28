'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import type { FactCheckOutput } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';

const factCheckSchema = z.object({
  text: z.string().min(50, 'Please enter at least 50 characters for an accurate analysis.'),
});

type FactCheckFormValues = z.infer<typeof factCheckSchema>;

export function useFactCheckerLogic() {
  const { t } = useLocalization();
  const [isUploading, setIsUploading] = useState(false);
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
  
  const onFileUpload = (fileContent: string) => {
    form.setValue('text', fileContent, { shouldValidate: true });
    toast({ title: t('writingTools.aiDetector.toastFileProcessed') });
  };

  const onSubmit = (data: FactCheckFormValues) => {
    mutation.mutate(data);
  };

  const results = mutation.data as FactCheckOutput | null;

  return {
    t,
    form,
    mutation,
    isUploading,
    setIsUploading,
    onFileUpload,
    onSubmit,
    results,
  };
}
