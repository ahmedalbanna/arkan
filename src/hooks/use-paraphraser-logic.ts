
'use client';

import { ParaphraseModeSchema } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { useTextProcessor } from '@/core';
import { z } from 'zod';

// مخطط التحقق من البيانات
const paraphraserSchema = z.object({
  text: z.string().min(10, 'Please enter at least 10 characters to paraphrase.'),
  mode: ParaphraseModeSchema,
});

// القيم الافتراضية
const defaultValues = {
  text: '',
  mode: 'standard' as const,
};

/**
 * Hook محسن لمعالج إعادة الصياغة
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useParaphraserLogic() {
  const { t } = useLocalization();

  const textProcessor = useTextProcessor({
    toolName: 'paraphraser',
    apiEndpoint: 'paraphrase',
    schema: paraphraserSchema,
    defaultValues,
    successMessage: t('writingTools.paraphraser.toastSuccess'),
    errorMessage: t('writingTools.paraphraser.toastError'),
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
    paraphrasedText: textProcessor.processedText,

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
    paraphraseMutation: textProcessor.mutation,
  };
}
