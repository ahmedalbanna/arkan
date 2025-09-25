
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import type { DiffPart } from '@/lib/diff';
import { computeDiff } from '@/lib/diff';
import { useLocalization } from '@/context/LocalizationContext';

const formSchema = z.object({
  text: z.string().min(10, 'Please enter at least 10 characters.'),
  style: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function useTextStylistLogic() {
  const { t } = useLocalization();
  const [originalText, setOriginalText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [diff, setDiff] = useState<DiffPart[] | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [compressionRatio, setCompressionRatio] = useState(50);
  const [activeView, setActiveView] = useState<'side-by-side' | 'diff'>('side-by-side');
  const { toast } = useToast();

  const rewriteMutation = useWritingTool('rewrite-text');
  const summarizeMutation = useWritingTool('summarize-with-ratio');
  const isProcessing = rewriteMutation.isPending || summarizeMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { text: '', style: 'None' },
  });

  const onSubmitRewrite = (data: FormValues) => {
    if (!data.style || data.style === 'None') {
      toast({ title: t('writingTools.textStylist.toastStyleRequired'), description: t('writingTools.textStylist.toastStyleRequiredDesc'), variant: 'destructive' });
      return;
    }
    setOriginalText(data.text);
    setProcessedText('');
    setDiff(null);
    setActiveView('side-by-side');
    rewriteMutation.mutate({ text: data.text, style: data.style }, {
      onSuccess: (result: any) => {
        setProcessedText(result.rewrittenText);
        setDiff(computeDiff(data.text, result.rewrittenText));
      },
      onError: (error) => toast({ title: t('writingTools.textStylist.toastStyleRequired'), description: error.message, variant: 'destructive' })
    });
  };

  const onSubmitSummarize = (data: FormValues) => {
    setOriginalText(data.text);
    setProcessedText('');
    setDiff(null);
    setActiveView('side-by-side');
    summarizeMutation.mutate({ text: data.text, ratio: compressionRatio }, {
        onSuccess: (result: any) => setProcessedText(result.summarizedText)
    });
  };

  const handleCopy = () => {
    if (!processedText) return;
    navigator.clipboard.writeText(processedText).then(() => {
      setIsCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return {
    t,
    form,
    rewriteMutation,
    summarizeMutation,
    isProcessing,
    originalText,
    processedText,
    diff,
    isCopied,
    compressionRatio,
    setCompressionRatio,
    activeView,
    setActiveView,
    onSubmitRewrite,
    onSubmitSummarize,
    handleCopy,
  };
}
