
'use client';

import type { FactCheckOutput } from '@/ai/schemas';
import { useTextProcessor } from '@/core';
import { z } from 'zod';

// مخطط التحقق من البيانات
const factCheckerSchema = z.object({
  text: z.string().min(50, 'Please enter at least 50 characters for a thorough fact-check.'),
});

// القيم الافتراضية
const defaultValues = {
  text: '',
};

/**
 * Hook محسن لمعالج فحص الحقائق
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useFactCheckerLogic() {
  const textProcessor = useTextProcessor({
    toolName: 'fact-checker',
    apiEndpoint: '/api/writing-tools/fact-checker',
    schema: factCheckerSchema,
    defaultValues,
    successMessage: 'Fact-check completed successfully!',
    errorMessage: 'Fact-check failed',
    enableFileUpload: true,
    acceptedFileTypes: ['application/pdf', 'text/plain', 'text/markdown'],
  });

  // الحصول على النتائج من الطفرة
  const results = textProcessor.mutation.data as FactCheckOutput | undefined;

  return {
    // النموذج والحالة
    form: textProcessor.form,
    isProcessing: textProcessor.isProcessing,

    // النصوص
    originalText: textProcessor.originalText,
    processedText: textProcessor.processedText,

    // رفع الملفات
    isUploading: textProcessor.isUploading,
    getRootProps: textProcessor.getRootProps,
    getInputProps: textProcessor.getInputProps,
    isDragActive: textProcessor.isDragActive,

    // المعالجة
    onSubmit: textProcessor.handleSubmit,

    // النتائج
    results,

    // الطفرة (للتوافق مع الكود الموجود)
    mutation: textProcessor.mutation,
  };
}
