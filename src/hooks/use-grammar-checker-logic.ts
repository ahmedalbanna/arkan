
'use client';

import type { GrammarCheckOutput } from '@/ai/schemas';
import { useTextProcessor } from '@/core';
import { z } from 'zod';

// مخطط التحقق من البيانات
const grammarSchema = z.object({
  text: z.string().min(5, 'Text must be at least 5 characters to check.'),
});

// القيم الافتراضية
const defaultValues = {
  text: '',
};

/**
 * Hook محسن لمعالج فحص القواعد النحوية
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useGrammarCheckerLogic() {
  const textProcessor = useTextProcessor({
    toolName: 'grammar-checker',
    apiEndpoint: '/api/writing-tools/grammar-checker',
    schema: grammarSchema,
    defaultValues,
    successMessage: 'Grammar check successful!',
    errorMessage: 'Grammar check failed',
    enableFileUpload: true,
    acceptedFileTypes: ['application/pdf', 'text/plain', 'text/markdown'],
  });

  // الحصول على النتائج من الطفرة
  const results = textProcessor.mutation.data as GrammarCheckOutput | undefined;

  return {
    // النموذج والحالة
    form: textProcessor.form,
    isProcessing: textProcessor.isProcessing,

    // النصوص
    originalText: textProcessor.originalText,
    processedText: textProcessor.processedText,

    // النسخ
    isCopied: textProcessor.isCopied,
    handleCopy: () => textProcessor.copyToClipboard(results?.correctedText || ''),

    // رفع الملفات
    isUploading: textProcessor.isUploading,
    getRootProps: textProcessor.getRootProps,
    getInputProps: textProcessor.getInputProps,
    isDragActive: textProcessor.isDragActive,

    // المعالجة
    onSubmit: textProcessor.handleSubmit,

    // النتائج والطفرة (للتوافق مع الكود الموجود)
    results,
    mutation: textProcessor.mutation,
  };
}
