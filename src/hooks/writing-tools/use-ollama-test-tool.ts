
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWritingTool, useToast } from '@/hooks';

const formSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty."),
});

type FormValues = z.infer<typeof formSchema>;

export function useOllamaTestTool() {
  const { toast } = useToast();

  const mutation = useWritingTool('ollama-test', {
    onSuccess: (data: any) => {
      toast({ title: 'Ollama Response Received', description: `Model: ${data.model}` });
    },
    onError: (error) => {
      toast({
        title: 'Ollama Test Failed',
        description: error.message || 'Could not connect to the Ollama server.',
        variant: 'destructive',
      });
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  const results = mutation.data as { response: string; model: string } | null;

  return {
    form,
    mutation,
    onSubmit,
    results,
  };
}
