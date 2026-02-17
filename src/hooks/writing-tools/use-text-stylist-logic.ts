
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import type { DiffPart } from '@/lib/utils/diff';
import { computeDiff } from '@/lib/utils/diff';
import { useLocalization } from '@/context/LocalizationContext';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { writingToolApi } from '@/services/api/writingToolsService';

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
  const { firebaseUser } = useAuth();
  const [originalText, setOriginalText] = useState('');
  const [processedText, setProcessedText] = useState<any>(null); // Can be string or object
  const [diff, setDiff] = useState<DiffPart[] | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [compressionRatio, setCompressionRatio] = useState(50);
  const [activeView, setActiveView] = useState<'side-by-side' | 'diff'>('side-by-side');
  const { toast } = useToast();

  const handleSuccess = (data: any, variables: any) => {
    const original = variables.text;
    let resultText = '';
    
    // Determine the result text based on the returned data structure
    if (data.rewrittenText) resultText = data.rewrittenText;
    else if (data.summarizedText) resultText = data.summarizedText;
    else if (data.editedText) resultText = data.editedText;
    else if (data.enhancedText) resultText = data.enhancedText;
    else if (data.conciseText) resultText = data.conciseText;
    else if (data.improvedText) resultText = data.improvedText;
    else resultText = JSON.stringify(data, null, 2);

    setProcessedText(data); // Store the whole object
    setDiff(computeDiff(original, resultText));
    toast({ title: 'Processing Complete!' });
  };

  const handleError = (error: Error) => {
    toast({ 
      title: 'Error', 
      description: error.message, 
      variant: 'destructive' 
    });
  };
  
  const rewriteMutation = useMutation({
    mutationFn: async (variables: any) => {
      if (!firebaseUser) throw new Error('User not authenticated');
      const token = await firebaseUser.getIdToken();
      return writingToolApi<any, any>('/api/writing-tools/rewrite-text', {
        data: { flow: 'rewrite-text', text: variables.text, style: variables.style },
        token
      });
    },
    onSuccess: (data, variables) => handleSuccess(data, variables),
    onError: handleError,
  });

  const summarizeMutation = useMutation({
    mutationFn: async (variables: any) => {
      if (!firebaseUser) throw new Error('User not authenticated');
      const token = await firebaseUser.getIdToken();
      return writingToolApi<any, any>('/api/writing-tools/summarize-text-with-ratio', {
        data: { flow: 'summarize-with-ratio', text: variables.text, ratio: variables.ratio },
        token
      });
    },
    onSuccess: (data, variables) => handleSuccess(data, variables),
    onError: handleError,
  });

  const styleEditorMutation = useMutation({
    mutationFn: async (variables: any) => {
      if (!firebaseUser) throw new Error('User not authenticated');
      const token = await firebaseUser.getIdToken();
      return writingToolApi<any, any>('/api/writing-tools/style-editor', {
        data: { flow: 'style-editor', text: variables.text, targetAudience: variables.targetAudience, tone: variables.tone },
        token
      });
    },
    onSuccess: (data, variables) => handleSuccess(data, variables),
    onError: handleError,
  });

  const readabilityMutation = useMutation({
    mutationFn: async (variables: any) => {
      if (!firebaseUser) throw new Error('User not authenticated');
      const token = await firebaseUser.getIdToken();
      return writingToolApi<any, any>('/api/writing-tools/readability-enhancer', {
        data: { flow: 'readability-enhancer', text: variables.text, targetLevel: variables.targetLevel },
        token
      });
    },
    onSuccess: (data, variables) => handleSuccess(data, variables),
    onError: handleError,
  });

  const concisenessMutation = useMutation({
    mutationFn: async (variables: any) => {
      if (!firebaseUser) throw new Error('User not authenticated');
      const token = await firebaseUser.getIdToken();
      return writingToolApi<any, any>('/api/writing-tools/conciseness-checker', {
        data: { flow: 'conciseness-checker', text: variables.text, targetReduction: variables.targetReduction },
        token
      });
    },
    onSuccess: (data, variables) => handleSuccess(data, variables),
    onError: handleError,
  });

  const clarityMutation = useMutation({
    mutationFn: async (variables: any) => {
      if (!firebaseUser) throw new Error('User not authenticated');
      const token = await firebaseUser.getIdToken();
      return writingToolApi<any, any>('/api/writing-tools/clarity-advisor', {
        data: { flow: 'clarity-advisor', text: variables.text, focusAreas: variables.focusAreas },
        token
      });
    },
    onSuccess: (data, variables) => handleSuccess(data, variables),
    onError: handleError,
  });

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
    let textToCopy = '';
    if (typeof processedText === 'string') textToCopy = processedText;
    else if (processedText.rewrittenText) textToCopy = processedText.rewrittenText;
    else if (processedText.editedText) textToCopy = processedText.editedText;
    else if (processedText.enhancedText) textToCopy = processedText.enhancedText;
    else if (processedText.conciseText) textToCopy = processedText.conciseText;
    else if (processedText.improvedText) textToCopy = processedText.improvedText;
    
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
