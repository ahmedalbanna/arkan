
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { CitationStyleSchema } from '@/modules/ai/domain/schemas';
import { useLocalization } from '@/context/LocalizationContext';

const citationSchema = z.object({
  sourceText: z.string().min(10, 'Please enter a valid source (URL, title, etc.).'),
  style: CitationStyleSchema,
});

type CitationFormValues = z.infer<typeof citationSchema>;

export function useCitationGeneratorLogic() {
  const { t } = useLocalization();
  const { toast } = useToast();
  const [generatedCitations, setGeneratedCitations] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  const mutation = useWritingTool('/api/writing-tools/citation-generator', {
    onSuccess: (data: any) => {
      setGeneratedCitations(data.citations);
      toast({ title: t('writingTools.citationGenerator.toastSuccess') });
    },
  });

  const form = useForm<CitationFormValues>({
    resolver: zodResolver(citationSchema),
    defaultValues: { sourceText: '', style: 'apa' },
  });

  const onSubmit = (data: CitationFormValues) => {
    mutation.mutate(data);
  };

  const handleCopy = () => {
    if (generatedCitations.length === 0) return;
    const textToCopy = generatedCitations.join('\n\n');
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
    generatedCitations,
    isCopied,
    handleCopy,
  };
}
