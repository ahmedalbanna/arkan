
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWritingTool, useToast } from '@/hooks';
import { IdeaGenerationInputSchema, type IdeaGenerationInput, type IdeaGenerationOutput } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';

const formSchema = IdeaGenerationInputSchema;
type FormValues = IdeaGenerationInput;

export function useIdeaGeneratorLogic() {
  const { t } = useLocalization();
  const { toast } = useToast();

  const mutation = useWritingTool('/api/writing-tools/generate-ideas', {
    onError: (error) => {
        toast({ title: "Idea Generation Failed", description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      specialization: '',
      domain: '',
      region: '',
      circumstances: '',
      additionalContext: ''
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  const results = mutation.data as IdeaGenerationOutput | undefined;

  return {
    t,
    form,
    mutation,
    onSubmit,
    results,
  };
}
