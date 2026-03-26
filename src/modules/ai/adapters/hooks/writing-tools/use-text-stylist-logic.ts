
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

// Helper for mocked mutations
const createMockMutation = (onSuccessCallback: (data: any, variables: any) => void) => {
    return useMutation({
        mutationFn: async (variables: any) => {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
            // This is where you return the hardcoded data
            if (variables.style) return { rewrittenText: `This is a hardcoded rewritten text in a '${variables.style}' style.` };
            if (variables.ratio) return { summarizedText: `This is a hardcoded summary compressed to about ${variables.ratio}% of the original.` };
            if (variables.targetAudience || variables.tone) return { editedText: 'This is a sample of improved style, tailored for the specified audience and tone.', improvements: ['Improved sentence flow', 'Adjusted vocabulary'] };
            if (variables.targetLevel) return { enhancedText: 'This text is now easier to read, with simpler sentences and clearer words.', readabilityScore: 85, improvements: ['Simplified complex sentences'] };
            if (variables.targetReduction !== undefined) return { conciseText: 'This is the concise version of your text.', originalWordCount: variables.text.split(' ').length, newWordCount: Math.floor(variables.text.split(' ').length * 0.8), reductionPercentage: 20 };
            if (variables.focusAreas) return { improvedText: 'This text has been analyzed for clarity based on your focus areas.', clarityScore: 92, suggestions: [{ issue: 'Vague phrasing', suggestion: 'Use more specific language' }] };
            return { message: "Mocked response" };
        },
        onSuccess: (data, variables) => onSuccessCallback(data, variables),
        onError: (error, variables, context) => {
            // Your existing error handling
        }
    });
};

export function useTextStylistLogic() {
  const { t } = useLocalization();
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
  
  const rewriteMutation = createMockMutation(handleSuccess);
  const summarizeMutation = createMockMutation(handleSuccess);
  const styleEditorMutation = createMockMutation(handleSuccess);
  const readabilityMutation = createMockMutation(handleSuccess);
  const concisenessMutation = createMockMutation(handleSuccess);
  const clarityMutation = createMockMutation(handleSuccess);

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
