
'use client';

import type { IdeaGenerationOutput } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { useToast, useWritingTool } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const ideaGeneratorSchema = z.object({
  specialization: z.string().min(5, 'Please provide your specialization.'),
  domain: z.string().optional(),
  region: z.string().optional(),
  circumstances: z.string().optional(),
  additionalContext: z.string().optional(),
});

type IdeaGeneratorFormValues = z.infer<typeof ideaGeneratorSchema>;

export function useIdeaGeneratorLogic() {
  const { t } = useLocalization();
  const { toast } = useToast();

  const mutation = useWritingTool('generate-ideas', {
    onError: (error) => {
      toast({ title: 'Idea Generation Failed', description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<IdeaGeneratorFormValues>({
    resolver: zodResolver(ideaGeneratorSchema),
    defaultValues: {
      specialization: '',
      domain: '',
      region: '',
      circumstances: '',
      additionalContext: '',
    },
  });

  const onSubmit = (data: IdeaGeneratorFormValues) => {
    mutation.mutate(data);
  };

  const results = mutation.data as IdeaGenerationOutput | null;

  return {
    t,
    form,
    mutation,
    onSubmit,
    results,
  };
}
