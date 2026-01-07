
'use client';

import type { GeneratePresentationOutlineOutput } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { useToast, useWritingTool } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const outlineSchema = z.object({
  prompt: z.string().min(10, 'Please provide a more detailed topic.'),
  documentation: z.string().optional(),
});

type OutlineFormValues = z.infer<typeof outlineSchema>;

export function usePresentationOutlineLogic() {
  const { t } = useLocalization();
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const mutation = useWritingTool('generate-presentation-outline');

  const form = useForm<OutlineFormValues>({
    resolver: zodResolver(outlineSchema),
    defaultValues: { prompt: '', documentation: '' },
  });

  const onSubmit = (data: OutlineFormValues) => {
    mutation.mutate(data, {
      onSuccess: () => {
        toast({ title: 'Outline generated successfully!' });
      },
      onError: (error) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    });
  };

  const results = mutation.data as GeneratePresentationOutlineOutput | null;

  const textToCopy = results
    ? `# ${results.cover.title}\n\n${results.outline.map(item => `## ${item.title}\n${item.content}`).join('\n\n')}`
    : '';

  const handleCopy = () => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    toast({ title: 'Copied to clipboard!' });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return {
    t,
    form,
    mutation,
    onSubmit,
    results,
    isCopied,
    handleCopy,
  };
}
