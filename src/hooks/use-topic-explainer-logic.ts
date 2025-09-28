'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { createContentGeneratorHook } from '@/core';
import { z } from 'zod';

// مخطط التحقق من البيانات
const topicExplainerSchema = z.object({
  topic: z.string().min(3, 'Please enter a topic to explain.'),
});

// القيم الافتراضية
const defaultValues = {
  topic: '',
};

/**
 * Hook محسن لشرح المواضيع
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useTopicExplainerLogic() {
  const { t } = useLocalization();

  const contentGenerator = createContentGeneratorHook({
    toolName: 'topic-explainer',
    apiEndpoint: '/api/writing-tools/topic-explainer',
    schema: topicExplainerSchema,
    defaultValues,
    successMessage: t('writingTools.topicExplainer.successToast') || 'Topic explained successfully!',
    errorMessage: t('writingTools.topicExplainer.errorToast') || 'Failed to explain topic',
    enableFileUpload: false, // هذا الأداة لا تدعم رفع الملفات
    outputFormat: 'text',
    customFeatures: {
      formatOutput: (data: any) => {
        if (data.explanation) {
          return {
            explanation: data.explanation,
            metadata: {
              topic: data.topic,
              wordCount: data.explanation.length,
              complexity: data.complexity || 'medium',
              language: data.language || 'en',
            }
          };
        }
        return data;
      },
      validateInput: (data: any) => {
        return data.topic?.length >= 3;
      },
      getProgressSteps: () => [
        'Analyzing topic',
        'Researching information',
        'Structuring explanation',
        'Generating content',
        'Finalizing explanation'
      ]
    }
  })();

  // الحصول على النتائج من الطفرة
  const results = contentGenerator.mutation.data as { explanation: string } | undefined;

  return {
    // الترجمة
    t,

    // النموذج والحالة
    form: contentGenerator.form,
    isProcessing: contentGenerator.isProcessing,

    // النصوص والمحتوى
    originalText: contentGenerator.originalText,
    processedText: contentGenerator.processedText,
    generatedContent: contentGenerator.generatedContent,

    // النسخ
    isCopied: contentGenerator.isCopied,
    handleCopy: () => contentGenerator.copyToClipboard(contentGenerator.generatedContent || contentGenerator.processedText),

    // المعالجة
    onSubmit: contentGenerator.handleSubmit,
    reset: contentGenerator.reset,

    // النتائج والوظائف المساعدة
    results,
    formatOutput: contentGenerator.formatOutput,
    validateInput: contentGenerator.validateInput,
    getProgressSteps: contentGenerator.getProgressSteps,

    // الطفرة (للتوافق مع الكود الموجود)
    mutation: contentGenerator.mutation,
  };
}
