
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';

const explainerSchema = z.object({
  topic: z.string().min(3, 'Please enter a topic to explain.'),
});

type ExplainerFormValues = z.infer<typeof explainerSchema>;

export function useTopicExplainerLogic() {
  const mutation = useWritingTool('topic-explainer');
  const { t } = useLocalization();
  const { toast } = useToast();

  const form = useForm<ExplainerFormValues>({
    resolver: zodResolver(explainerSchema),
    defaultValues: { topic: '' },
  });

  const onSubmit = async (data: ExplainerFormValues) => {
    mutation.mutate(data, {
      onError: (error) => {
        toast({ title: "Explanation Failed", description: error.message, variant: 'destructive' });
      },
    });
  };

  const results = mutation.data as string | undefined;

  return {
    t,
    form,
    mutation,
    onSubmit,
    results,
  };
}
