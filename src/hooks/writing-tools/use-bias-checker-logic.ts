'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import type { BiasCheckOutput } from '@/ai/schemas';

const biasCheckSchema = z.object({
  text: z.string().min(50, 'Please enter at least 50 characters for an accurate analysis.'),
});

type BiasCheckFormValues = z.infer<typeof biasCheckSchema>;

export function useBiasCheckerLogic() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const mutation = useWritingTool('/api/writing-tools/bias-checker', {
    onError: (error) => {
      toast({ title: 'Bias Check Failed', description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<BiasCheckFormValues>({
    resolver: zodResolver(biasCheckSchema),
    defaultValues: { text: '' },
  });

  const onFileUpload = (fileContent: string) => {
    form.setValue('text', fileContent, { shouldValidate: true });
    toast({ title: 'File Processed' });
  };

  const onSubmit = (data: BiasCheckFormValues) => {
    mutation.mutate(data);
  };

  const results = mutation.data as BiasCheckOutput | null;

  return {
    form,
    mutation,
    isUploading,
    setIsUploading,
    onFileUpload,
    onSubmit,
    results,
  };
}
