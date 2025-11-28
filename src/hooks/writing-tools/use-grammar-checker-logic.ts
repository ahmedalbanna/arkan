'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import type { GrammarCheckOutput } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';

const grammarCheckSchema = z.object({
  text: z.string().min(10, 'Please enter at least 10 characters to check.'),
});

type GrammarCheckFormValues = z.infer<typeof grammarCheckSchema>;

export function useGrammarCheckerLogic() {
  const { t } = useLocalization();
  const [isUploading, setIsUploading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const mutation = useWritingTool('/api/writing-tools/grammar-checker');

  const form = useForm<GrammarCheckFormValues>({
    resolver: zodResolver(grammarCheckSchema),
    defaultValues: { text: '' },
  });

  const onFileUpload = (fileContent: string) => {
    form.setValue('text', fileContent, { shouldValidate: true });
    toast({ title: t('writingTools.grammarChecker.fileProcessed') });
  };
  
  const onSubmit = (data: GrammarCheckFormValues) => {
    mutation.mutate(data);
  };

  const handleCopy = () => {
    const correctedText = (mutation.data as GrammarCheckOutput)?.correctedText;
    if (!correctedText) return;
    navigator.clipboard.writeText(correctedText).then(() => {
        setIsCopied(true);
        toast({ title: 'Copied to clipboard!' });
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const results = mutation.data as GrammarCheckOutput | null;

  return {
    t,
    form,
    mutation,
    isUploading,
    setIsUploading,
    onFileUpload,
    onSubmit,
    results,
    isCopied,
    handleCopy,
  };
}
