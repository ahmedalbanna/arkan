
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool } from './use-writing-tool';
import { useToast } from '@/hooks/util/use-toast';
import { useLocalization } from '@/context/LocalizationContext';
import { GenerateTocOutputSchema } from '@/ai/schemas';

const generateTocSchema = z.object({
  projectDescription: z.string().min(10, 'Project description must be at least 10 characters.'),
});

export function useGenerateTocLogic() {
  const { t } = useLocalization();
  const { toast } = useToast();

  const mutation = useWritingTool('/api/writing-tools/generate-toc', {
    onError: (error) => {
      toast({
        title: 'Error generating TOC',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(generateTocSchema),
    defaultValues: {
      projectDescription: '',
    },
  });

  const onSubmit = (data: z.infer<typeof generateTocSchema>) => {
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

    