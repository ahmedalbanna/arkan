
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { createWritingToolHook } from '@/core';
import { useToast, useWritingTool } from '@/hooks';
import type { DiffPart } from '@/lib/diff';
import { computeDiff } from '@/lib/diff';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  text: z.string().min(10, 'Please enter at least 10 characters.'),
  style: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * Hook محسن لمعالج تنسيق النصوص
 * يحتوي على وظيفتين: إعادة الكتابة والتلخيص
 */
export function useTextStylistLogic() {
  const { t } = useLocalization();
  const [originalText, setOriginalText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [diff, setDiff] = useState<DiffPart[] | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [compressionRatio, setCompressionRatio] = useState(50);
  const [activeView, setActiveView] = useState<'side-by-side' | 'diff'>('side-by-side');
  const { toast } = useToast();

  // استخدام النظام الجديد من src/core
  const textStylistTool = createWritingToolHook({
    toolName: 'text-stylist',
    apiEndpoint: '/api/writing-tools/text-stylist',
    schema: formSchema,
    defaultValues: { text: '', style: 'None' },
    successMessage: t('writingTools.textStylist.successToast') || 'Text styled successfully!',
    errorMessage: t('writingTools.textStylist.errorToast') || 'Failed to style text',
    enableFileUpload: true,
    acceptedFileTypes: ['application/pdf', 'text/plain', 'text/markdown'],
    customFeatures: ['rewrite', 'summarize', 'diff']
  })();

  // الطفرات
  const rewriteMutation = useWritingTool('rewrite-text');
  const summarizeMutation = useWritingTool('summarize-with-ratio');
  const isProcessing = rewriteMutation.isPending || summarizeMutation.isPending || textStylistTool.isProcessing;

  // النموذج
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { text: '', style: 'None' },
  });

  // معالج إعادة الكتابة
  const onSubmitRewrite = (data: FormValues) => {
    if (!data.style || data.style === 'None') {
      toast({
        title: t('writingTools.textStylist.toastStyleRequired'),
        description: t('writingTools.textStylist.toastStyleRequiredDesc'),
        variant: 'destructive'
      });
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
      onError: (error) => {
        toast({
          title: t('writingTools.textStylist.toastStyleRequired'),
          description: error.message,
          variant: 'destructive'
        });
      }
    });
  };

  // معالج التلخيص
  const onSubmitSummarize = (data: FormValues) => {
    setOriginalText(data.text);
    setProcessedText('');
    setDiff(null);
    setActiveView('side-by-side');

    summarizeMutation.mutate({ text: data.text, ratio: compressionRatio }, {
      onSuccess: (result: any) => {
        setProcessedText(result.summarizedText);
      }
    });
  };

  // معالج النسخ
  const handleCopy = () => {
    if (!processedText) return;
    navigator.clipboard.writeText(processedText).then(() => {
      setIsCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return {
    // الترجمة
    t,

    // النموذج والحالة
    form,
    isProcessing,

    // النصوص والنتائج
    originalText,
    processedText,
    diff,

    // النسخ
    isCopied,
    handleCopy,

    // إعدادات التلخيص
    compressionRatio,
    setCompressionRatio,

    // إعدادات العرض
    activeView,
    setActiveView,

    // المعالجات
    onSubmitRewrite,
    onSubmitSummarize,

    // الطفرات (للتوافق مع الكود الموجود)
    rewriteMutation,
    summarizeMutation,

    // النظام الجديد من src/core
    textStylistTool,
    isProcessing: textStylistTool.isProcessing || isProcessing,
    processedText: textStylistTool.processedText || processedText,
    isCopied: textStylistTool.isCopied || isCopied,
    handleCopy: textStylistTool.handleCopy || handleCopy,
    onSubmit: textStylistTool.onSubmit,
    reset: textStylistTool.reset,
  };
}
