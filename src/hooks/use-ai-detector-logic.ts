
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useTextProcessor } from '@/core';
import { z } from 'zod';

// مخطط التحقق من البيانات
const aiDetectorSchema = z.object({
  text: z.string().min(100, 'Please enter at least 100 characters for an accurate analysis.'),
});

// القيم الافتراضية
const defaultValues = {
  text: '',
};

/**
 * Hook محسن لمعالج كشف الذكاء الاصطناعي
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useAIDetectorLogic() {
  const { t } = useLocalization();

  const textProcessor = useTextProcessor({
    toolName: 'ai-detector',
    apiEndpoint: 'ai-detector',
    schema: aiDetectorSchema,
    defaultValues,
    successMessage: t('writingTools.aiDetector.toastAnalysisSuccess') || 'Analysis completed successfully!',
    errorMessage: t('writingTools.aiDetector.toastAnalysisFailed') || 'Analysis failed',
    enableFileUpload: true,
    acceptedFileTypes: ['application/pdf', 'text/plain', 'text/markdown'],
  });

  // الحصول على النتائج من الطفرة
  const results = textProcessor.mutation.data as AIAnalysisResult | undefined;

  // دالة لتحديد لون النتيجة
  const getScoreColor = (score: number) => {
    if (score > 75) return 'text-destructive';
    if (score > 40) return 'text-yellow-500';
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

// نوع النتيجة
export interface AIAnalysisResult {
  score: number;
  analysis: string;
}
