
'use client';

import { GeneratePresentationOutlineOutput } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { createContentGeneratorHook } from '@/core';
import { z } from 'zod';

// مخطط التحقق من البيانات
const presentationOutlineSchema = z.object({
  prompt: z.string().min(5, 'Please enter a topic with at least 5 characters.'),
  documentation: z.string().optional(),
});

// القيم الافتراضية
const defaultValues = {
  prompt: '',
  documentation: '',
};

/**
 * Hook محسن لمولد خطط العروض التقديمية
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function usePresentationOutlineLogic() {
  const { t } = useLocalization();

  const contentGenerator = createContentGeneratorHook({
    toolName: 'presentation-outline',
    apiEndpoint: '/api/writing-tools/presentation-outline',
    schema: presentationOutlineSchema,
    defaultValues,
    successMessage: t('writingTools.presentationOutline.successToast') || 'Outline generated successfully!',
    errorMessage: t('writingTools.presentationOutline.errorToast') || 'Failed to generate outline',
    enableFileUpload: false, // هذا الأداة لا تدعم رفع الملفات
    outputFormat: 'json',
    customFeatures: {
      formatOutput: (data: any) => {
        if (data.outline) {
          return {
            outline: data.outline,
            cover: data.cover,
            metadata: {
              slideCount: data.outline.length,
              estimatedDuration: data.outline.length * 2, // تقدير دقيقتين لكل شريحة
              difficulty: data.difficulty || 'medium',
              targetAudience: data.targetAudience || 'General',
            }
          };
        }
        return data;
      },
      validateInput: (data: any) => {
        return data.prompt?.length >= 5;
      },
      getProgressSteps: () => [
        'Analyzing topic',
        'Researching content',
        'Creating structure',
        'Generating slides',
        'Finalizing outline'
      ]
    }
  })();

  // الحصول على النتائج من الطفرة
  const results = contentGenerator.mutation.data as GeneratePresentationOutlineOutput | undefined;

  // معالج النسخ المخصص للعروض التقديمية
  const handleCopy = () => {
    if (!results) return;
    const textToCopy = `${results.cover.title}\n\n` + results.outline.map(item => `${item.title}\n${item.content}`).join('\n\n');
    contentGenerator.copyToClipboard(textToCopy);
  };

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
    handleCopy,

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
