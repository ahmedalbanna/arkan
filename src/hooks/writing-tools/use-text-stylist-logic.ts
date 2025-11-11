
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import type { DiffPart } from '@/lib/utils/diff';
import { computeDiff } from '@/lib/utils/diff';
import { useLocalization } from '@/context/LocalizationContext';

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
  const [processedText, setProcessedText] = useState('');
  const [diff, setDiff] = useState<DiffPart[] | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [compressionRatio, setCompressionRatio] = useState(50);
  const [activeView, setActiveView] = useState<'side-by-side' | 'diff'>('side-by-side');
  const { toast } = useToast();

  const rewriteMutation = useWritingTool('/api/writing-tools/rewrite-text');
  const summarizeMutation = useWritingTool('/api/writing-tools/summarize-with-ratio');
  const styleEditorMutation = useWritingTool('/api/writing-tools/style-editor');
  const readabilityMutation = useWritingTool('/api/writing-tools/readability-enhancer');
  const concisenessMutation = useWritingTool('/api/writing-tools/conciseness-checker');
  const clarityMutation = useWritingTool('/api/writing-tools/clarity-advisor');
  const isProcessing = rewriteMutation.isPending || summarizeMutation.isPending || 
    styleEditorMutation.isPending || readabilityMutation.isPending || 
    concisenessMutation.isPending || clarityMutation.isPending;

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
        onSuccess: (result: any) => {
          setProcessedText(result.summarizedText);
          setDiff(computeDiff(data.text, result.summarizedText));
        }
    });
  };

  const onSubmitStyleEditor = (data: FormValues) => {
    setOriginalText(data.text);
    setProcessedText('');
    setDiff(null);
    setActiveView('side-by-side');
    styleEditorMutation.mutate({ 
      text: data.text, 
      targetAudience: data.targetAudience,
      tone: data.tone
    }, {
      onSuccess: (result: any) => {
        setProcessedText(result.editedText);
        setDiff(computeDiff(data.text, result.editedText));
      },
      onError: (error) => toast({ title: 'Error', description: error.message, variant: 'destructive' })
    });
  };

  const onSubmitReadability = (data: FormValues) => {
    setOriginalText(data.text);
    setProcessedText('');
    setDiff(null);
    setActiveView('side-by-side');
    readabilityMutation.mutate({ 
      text: data.text, 
      targetLevel: data.targetLevel as any
    }, {
      onSuccess: (result: any) => {
        setProcessedText(result.enhancedText);
        setDiff(computeDiff(data.text, result.enhancedText));
      },
      onError: (error) => toast({ title: 'Error', description: error.message, variant: 'destructive' })
    });
  };

  const onSubmitConciseness = (data: FormValues) => {
    setOriginalText(data.text);
    setProcessedText('');
    setDiff(null);
    setActiveView('side-by-side');
    concisenessMutation.mutate({ 
      text: data.text, 
      targetReduction: data.targetReduction
    }, {
      onSuccess: (result: any) => {
        setProcessedText(result.conciseText);
        setDiff(computeDiff(data.text, result.conciseText));
      },
      onError: (error) => toast({ title: 'Error', description: error.message, variant: 'destructive' })
    });
  };

  const onSubmitClarity = (data: FormValues) => {
    setOriginalText(data.text);
    setProcessedText('');
    setDiff(null);
    setActiveView('side-by-side');
    clarityMutation.mutate({ 
      text: data.text, 
      focusAreas: data.focusAreas
    }, {
      onSuccess: (result: any) => {
        setProcessedText(result.improvedText);
        setDiff(computeDiff(data.text, result.improvedText));
      },
      onError: (error) => toast({ title: 'Error', description: error.message, variant: 'destructive' })
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
