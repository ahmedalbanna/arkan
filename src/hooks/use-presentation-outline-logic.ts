
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { GeneratePresentationOutlineOutput } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';

const formSchema = z.object({
  prompt: z.string().min(5, 'Please enter a topic with at least 5 characters.'),
  documentation: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function usePresentationOutlineLogic() {
  const { t } = useLocalization();
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const mutation = useWritingTool('/api/writing-tools/presentation-outline');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: '', documentation: '' },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data, {
      onSuccess: () => {
        toast({ title: "Outline Generated!", description: "Review the outline and choose a template to proceed." });
      },
      onError: (error) => {
        toast({ title: "Outline Generation Failed", description: error.message, variant: "destructive" });
      }
    });
  };

  const results = mutation.data as GeneratePresentationOutlineOutput | undefined;

  const handleCopy = () => {
    if (!results) return;
    const textToCopy = `${results.cover.title}\n\n` + results.outline.map(item => `${item.title}\n${item.content}`).join('\n\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    });
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
