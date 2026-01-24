
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useToast, useWritingTool } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const explainerSchema = z.object({
  topic: z.string().min(3, 'Please enter a topic to explain.'),
});

type ExplainerFormValues = z.infer<typeof explainerSchema>;

export function useTopicExplainerLogic() {
  const mutation = useWritingTool('/api/writing-tools/topic-explainer');
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

  const results = mutation.data as { explanation: string } | undefined;

  return {
    t,
    form,
    mutation,
    onSubmit,
    results,
  };
}
