
'use client';

import type { PlagiarismCheckOutput } from '@/ai/schemas';
import { useTextProcessor } from '@/core';
import { z } from 'zod';

// مخطط التحقق من البيانات
const plagiarismSchema = z.object({
  text: z.string().min(100, 'Please enter at least 100 characters for a plagiarism check.'),
});

// القيم الافتراضية
const defaultValues = {
  text: '',
};

/**
 * Hook محسن لمعالج فحص الانتحال
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function usePlagiarismCheckerLogic() {
  const textProcessor = useTextProcessor({
    toolName: 'plagiarism-checker',
    apiEndpoint: '/api/writing-tools/plagiarism-checker',
    schema: plagiarismSchema,
    defaultValues,
    successMessage: 'Plagiarism check completed successfully!',
    errorMessage: 'Plagiarism check failed',
    enableFileUpload: true,
    acceptedFileTypes: ['application/pdf', 'text/plain', 'text/markdown'],
  });

  // الحصول على النتائج من الطفرة
  const results = textProcessor.mutation.data as PlagiarismCheckOutput | undefined;

  // دالة لتحديد لون النتيجة
  const getScoreColor = (score: number) => {
    if (score < 25) return 'text-destructive';
    if (score < 80) return 'text-yellow-500';
    return 'text-green-500';
  };

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

    // النتائج والوظائف المساعدة
    results,
    getScoreColor,

    // الطفرة (للتوافق مع الكود الموجود)
    mutation: textProcessor.mutation,
  };
}
