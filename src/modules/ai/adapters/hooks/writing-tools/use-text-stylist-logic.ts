
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import type { DiffPart } from '@/modules/projects/domain/utils/diff';
import { computeDiff } from '@/modules/projects/domain/utils/diff';
import { useLocalization } from '@/context/LocalizationContext';
import { useMutation } from '@tanstack/react-query';

const formSchema = z.object({
  text: z.string().min(10, 'Please enter at least 10 characters.'),
  style: z.string().optional(),
  targetAudience: z.string().optional(),
  tone: z.string().optional(),
  targetLevel: z.string().optional(),
  targetReduction: z.number().optional(),
  focusAreas: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function useTextStylistLogic() {
  const { t } = useLocalization();
  const [originalText, setOriginalText] = useState('');
  const [processedText, setProcessedText] = useState<any>(null); // Can be string or object
  const [diff, setDiff] = useState<DiffPart[] | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [compressionRatio, setCompressionRatio] = useState(50);
  const [activeView, setActiveView] = useState<'side-by-side' | 'diff'>('side-by-side');
  const { toast } = useToast();

  const handleSuccess = (data: string, variables: any) => {
    const original = variables.text;
    const resultText = data || '';

    setProcessedText(data); 
    setDiff(computeDiff(original, resultText));
    toast({ title: 'Processing Complete!' });
  };
  
  const rewriteMutation = useWritingTool('rewrite-text', { onSuccess: handleSuccess });
  const summarizeMutation = useWritingTool('summarize-ratio', { onSuccess: handleSuccess });
  const styleEditorMutation = useWritingTool('text-stylist', { onSuccess: handleSuccess });
  const readabilityMutation = useWritingTool('readability-enhancer', { onSuccess: handleSuccess });
  const concisenessMutation = useWritingTool('conciseness-checker', { onSuccess: handleSuccess });
  const clarityMutation = useWritingTool('clarity-advisor', { onSuccess: handleSuccess });

  const isProcessing = rewriteMutation.isPending || summarizeMutation.isPending || 
    styleEditorMutation.isPending || readabilityMutation.isPending || 
    concisenessMutation.isPending || clarityMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { text: '', style: 'None', targetReduction: 20, focusAreas: [] },
  });

  const handleGenericSubmit = (data: FormValues, mutation: any, payload: any) => {
    setOriginalText(data.text);
    setProcessedText('');
    setDiff(null);
    setActiveView('side-by-side');
    mutation.mutate({ text: data.text, ...payload });
  };

  const onSubmitRewrite = (data: FormValues) => {
    if (!data.style || data.style === 'None') {
      toast({ title: t('writingTools.textStylist.toastStyleRequired'), description: t('writingTools.textStylist.toastStyleRequiredDesc'), variant: 'destructive' });
      return;
    }
    handleGenericSubmit(data, rewriteMutation, { style: data.style });
  };

  const onSubmitSummarize = (data: FormValues) => {
    handleGenericSubmit(data, summarizeMutation, { ratio: compressionRatio });
  };
  
  const onSubmitStyleEditor = (data: FormValues) => {
    handleGenericSubmit(data, styleEditorMutation, { targetAudience: data.targetAudience, tone: data.tone });
  };
  
  const onSubmitReadability = (data: FormValues) => {
    handleGenericSubmit(data, readabilityMutation, { targetLevel: data.targetLevel });
  };

  const onSubmitConciseness = (data: FormValues) => {
    handleGenericSubmit(data, concisenessMutation, { targetReduction: data.targetReduction });
  };
  
  const onSubmitClarity = (data: FormValues) => {
    handleGenericSubmit(data, clarityMutation, { focusAreas: data.focusAreas });
  };

  const handleCopy = () => {
    if (!processedText) return;
    const textToCopy = processedText;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
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
    styleEditorMutation,
    readabilityMutation,
    concisenessMutation,
    clarityMutation,
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
    onSubmitStyleEditor,
    onSubmitReadability,
    onSubmitConciseness,
    onSubmitClarity,
    handleCopy,
  };
}
