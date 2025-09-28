
'use client';

import { IdeaGenerationInputSchema, type IdeaGenerationOutput } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { createContentGeneratorHook } from '@/core';

// مخطط التحقق من البيانات
const ideaGeneratorSchema = IdeaGenerationInputSchema;

// القيم الافتراضية
const defaultValues = {
  specialization: '',
  domain: '',
  region: '',
  circumstances: '',
  additionalContext: ''
};

/**
 * Hook محسن لمولد الأفكار
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useIdeaGeneratorLogic() {
  const { t } = useLocalization();

  const contentGenerator = createContentGeneratorHook({
    toolName: 'idea-generator',
    apiEndpoint: 'generate-ideas',
    schema: ideaGeneratorSchema,
    defaultValues,
    successMessage: t('writingTools.ideaGenerator.successToast') || 'Ideas generated successfully!',
    errorMessage: t('writingTools.ideaGenerator.errorToast') || 'Failed to generate ideas',
    enableFileUpload: false, // هذا الأداة لا تدعم رفع الملفات
    outputFormat: 'json',
    customFeatures: {
      formatOutput: (data: any) => {
        if (data.ideas) {
          return {
            ideas: data.ideas,
            metadata: {
              totalIdeas: data.ideas.length,
              categories: [...new Set(data.ideas.map((idea: any) => idea.category))],
              difficulty: data.difficulty || 'medium',
              estimatedTime: data.ideas.length * 5, // تقدير 5 دقائق لكل فكرة
            }
          };
        }
        return data;
      },
      validateInput: (data: any) => {
        return data.specialization?.length > 0 && data.domain?.length > 0;
      },
      getProgressSteps: () => [
        'Analyzing specialization',
        'Researching domain',
        'Generating ideas',
        'Categorizing results',
        'Finalizing output'
      ]
    }
  })();

  // الحصول على النتائج من الطفرة
  const results = contentGenerator.mutation.data as IdeaGenerationOutput | undefined;

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
