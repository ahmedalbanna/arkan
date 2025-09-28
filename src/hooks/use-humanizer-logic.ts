
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useTextProcessor } from '@/core';
import { z } from 'zod';

// مخطط التحقق من البيانات
const humanizerSchema = z.object({
  text: z.string().min(10, 'Please enter at least 10 characters.'),
});

// القيم الافتراضية
const defaultValues = {
  text: '',
};

/**
 * Hook محسن لمعالج إنسنة النصوص
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useHumanizerLogic() {
  const { t } = useLocalization();

  const textProcessor = useTextProcessor({
    toolName: 'humanizer',
    apiEndpoint: 'humanize',
    schema: humanizerSchema,
    defaultValues,
    successMessage: 'Text humanized successfully!',
    errorMessage: 'Failed to humanize text',
    enableFileUpload: false, // هذا الأداة لا تدعم رفع الملفات
  });

  return {
    // الترجمة
    t,

    // النموذج والحالة
    form: textProcessor.form,
    isProcessing: textProcessor.isProcessing,

    // النصوص
    originalText: textProcessor.originalText,
    processedText: textProcessor.processedText,

    // النسخ
    isCopied: textProcessor.isCopied,
    handleCopy: () => textProcessor.copyToClipboard(textProcessor.processedText),

    // المعالجة
    onSubmit: textProcessor.handleSubmit,

    // الطفرة (للتوافق مع الكود الموجود)
    mutation: textProcessor.mutation,
  };
}
