
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool } from './use-writing-tool';
import { useToast } from '@/hooks/util/use-toast';
import { useLocalization } from '@/context/LocalizationContext';
import { GenerateTocOutputSchema, GenerateTocInputSchema } from '@/ai/schemas';

type FormValues = z.infer<typeof GenerateTocInputSchema>;

export function useGenerateTocLogic() {
  const { t } = useLocalization();
  const { toast } = useToast();

  const mutation = useWritingTool('/api/writing-tools/generate-toc', {
    onSuccess: () => {
        toast({ title: "Table of Contents generated successfully!" });
    },
    onError: (error) => {
      toast({
        title: 'Error generating TOC',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(GenerateTocInputSchema),
    defaultValues: {
      projectDescription: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return {
    t,
    form,
    mutation,
    onSubmit,
    results: mutation.data as z.infer<typeof GenerateTocOutputSchema> | null,
  };
}
