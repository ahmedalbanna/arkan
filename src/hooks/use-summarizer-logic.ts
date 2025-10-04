
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useTextProcessor } from '@/core';
import { z } from 'zod';

// مخطط التحقق من البيانات
const summarizerSchema = z.object({
  text: z.string().min(20, 'Please enter at least 20 characters to summarize.'),
  length: z.enum(['short', 'medium', 'long']),
});

// القيم الافتراضية
const defaultValues = {
  text: '',
  length: 'medium' as const,
};

/**
 * Hook محسن لمعالج التلخيص
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useSummarizerLogic() {
  const { t } = useLocalization();

  const textProcessor = useTextProcessor({
    toolName: 'summarizer',
    apiEndpoint: 'summarize',
    schema: summarizerSchema,
    defaultValues,
    successMessage: t('writingTools.summarizer.successToast'),
    errorMessage: t('writingTools.summarizer.errorToast'),
    enableFileUpload: true,
    acceptedFileTypes: ['application/pdf', 'text/plain', 'text/markdown'],
  });

  return {
    // الترجمة
    t,

    // النموذج والحالة
    form: textProcessor.form,
    isProcessing: textProcessor.isProcessing,

    // النصوص
    originalText: textProcessor.originalText,
    summarizedText: textProcessor.processedText,

    // النسخ
    isCopied: textProcessor.isCopied,
    handleCopy: () => textProcessor.copyToClipboard(textProcessor.processedText),

    // رفع الملفات
    isUploading: textProcessor.isUploading,
    getRootProps: textProcessor.getRootProps,
    getInputProps: textProcessor.getInputProps,
    isDragActive: textProcessor.isDragActive,

    // المعالجة
    onSubmit: textProcessor.handleSubmit,

    // الطفرة (للتوافق مع الكود الموجود)
    summarizeMutation: textProcessor.mutation,
  };
}
