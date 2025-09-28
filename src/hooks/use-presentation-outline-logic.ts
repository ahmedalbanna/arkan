
'use client';

import { GeneratePresentationOutlineOutput } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { createPresentationToolHook } from '@/core';
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

  const presentationTool = createPresentationToolHook({
    toolName: 'presentation-outline',
    apiEndpoint: '/api/writing-tools/presentation-outline',
    schema: presentationOutlineSchema,
    defaultValues,
    successMessage: t('writingTools.presentationOutline.successToast') || 'Outline generated successfully!',
    errorMessage: t('writingTools.presentationOutline.errorToast') || 'Failed to generate outline',
    enableFileUpload: false, // هذا الأداة لا تدعم رفع الملفات
    presentationType: 'outline',
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
      getPresentationSections: () => [
        'Introduction',
        'Main Content',
        'Examples',
        'Conclusion',
        'Q&A'
      ],
      getSlideCount: (data: any) => {
        return data.outline?.length || 0;
      },
      getEstimatedDuration: (data: any) => {
        return (data.outline?.length || 0) * 2; // دقيقتين لكل شريحة
      }
    }
  })();

  // الحصول على النتائج من الطفرة
  const results = presentationTool.mutation.data as GeneratePresentationOutlineOutput | undefined;

  // معالج النسخ المخصص للعروض التقديمية
  const handleCopy = () => {
    if (!results) return;
    const textToCopy = `${results.cover.title}\n\n` + results.outline.map(item => `${item.title}\n${item.content}`).join('\n\n');
    presentationTool.copyToClipboard(textToCopy);
  };

  return {
    // الترجمة
    t,

    // النموذج والحالة
    form: presentationTool.form,
    isProcessing: presentationTool.isProcessing,

    // النصوص والمحتوى
    originalText: presentationTool.originalText,
    processedText: presentationTool.processedText,
    generatedPresentation: presentationTool.generatedPresentation,

    // النسخ
    isCopied: presentationTool.isCopied,
    handleCopy,

    // المعالجة
    onSubmit: presentationTool.onSubmit,
    reset: presentationTool.reset,

    // النتائج والوظائف المساعدة
    results,
    formatOutput: presentationTool.formatOutput,
    validateInput: presentationTool.validateInput,
    getPresentationSections: presentationTool.getPresentationSections,
    getSlideCount: presentationTool.getSlideCount,
    getEstimatedDuration: presentationTool.getEstimatedDuration,

    // الطفرة (للتوافق مع الكود الموجود)
    mutation: presentationTool.mutation,
  };
}
