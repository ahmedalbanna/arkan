
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import type { GenerateCitationOutput } from '@/ai/schemas';

const citationGeneratorSchema = z.object({
  sourceText: z.string().min(10, 'Please enter at least 10 characters of source material.'),
  style: z.enum(['apa', 'mla', 'chicago', 'ieee']),
});

type CitationFormValues = z.infer<typeof citationGeneratorSchema>;

export function useCitationGeneratorLogic() {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const mutation = useWritingTool('/api/writing-tools/citation-generator', {
    onError: (error) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<CitationFormValues>({
    resolver: zodResolver(citationGeneratorSchema),
    defaultValues: { sourceText: '', style: 'apa' },
  });

  const onSubmit = (data: CitationFormValues) => {
    mutation.mutate(data, {
        onSuccess: () => {
            toast({ title: 'Citation generated successfully!' });
        }
    });
  };

  const results = mutation.data as GenerateCitationOutput | undefined;
  const generatedCitations = results?.citations || [];

  const handleCopy = () => {
    if (generatedCitations.length === 0) return;
    navigator.clipboard.writeText(generatedCitations.join('\n\n')).then(() => {
        setIsCopied(true);
        toast({ title: 'Copied to clipboard!' });
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return {
    form,
    mutation,
    onSubmit,
    generatedCitations,
    isCopied,
    handleCopy,
  };
}
