
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { createContentGeneratorHook } from '@/core';
import { z } from 'zod';

// مخطط التحقق من البيانات
const documentWriterSchema = z.object({
  topic: z.string().min(5, 'Please enter a topic with at least 5 characters.'),
  documentType: z.string().min(1, 'Please select a document type.'),
  knowledge: z.string().optional(),
  tableOfContents: z.string().optional(),
});

// القيم الافتراضية
const defaultValues = {
  topic: '',
  documentType: 'essay',
  knowledge: '',
  tableOfContents: '',
};

/**
 * Hook محسن لكاتب المستندات
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useDocumentWriterLogic() {
  const { t } = useLocalization();

  const contentGenerator = createContentGeneratorHook({
    toolName: 'write-document',
    apiEndpoint: 'write-document',
    schema: documentWriterSchema,
    defaultValues,
    successMessage: t('writingTools.documentWriter.successToast') || 'Document generated successfully!',
    errorMessage: t('writingTools.documentWriter.errorToast') || 'Failed to generate document',
    enableFileUpload: false, // هذا الأداة لا تدعم رفع الملفات
    outputFormat: 'markdown',
    customFeatures: {
      formatOutput: (data: any) => {
        if (data.documentContent) {
          return {
            documentContent: data.documentContent,
            metadata: {
              topic: data.topic,
              documentType: data.documentType,
              wordCount: data.documentContent.split(' ').length,
              sectionCount: data.documentContent.split('#').length - 1,
              estimatedReadingTime: Math.ceil(data.documentContent.split(' ').length / 200), // تقدير دقيقة واحدة لكل 200 كلمة
            }
          };
        }
        return data;
      },
      validateInput: (data: any) => {
        return data.topic?.length >= 5 &&
          data.documentType?.length > 0 &&
          ['essay', 'report', 'article', 'blog', 'research'].includes(data.documentType);
      },
      getProgressSteps: () => [
        'Analyzing topic and requirements',
        'Researching content',
        'Structuring document',
        'Writing content',
        'Reviewing and editing',
        'Finalizing document'
      ]
    }
  })();

  // معالج الإرسال المخصص للمستندات
  const handleSubmit = (data: any) => {
    const submissionData = {
      ...data,
      tableOfContents: data.tableOfContents ?
        data.tableOfContents.split('\n').filter((line: string) => line.trim() !== '') :
        undefined,
    };
    contentGenerator.onSubmit(submissionData);
  };

  // الحصول على المحتوى المُولد
  const generatedContent = contentGenerator.mutation.data?.documentContent || '';

  // معالج النسخ المخصص
  const handleCopy = () => {
    if (!generatedContent) return;
    contentGenerator.handleCopy(generatedContent);
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
    generatedContent,

    // النسخ
    isCopied: contentGenerator.isCopied,
    handleCopy,

    // المعالجة
    onSubmit: handleSubmit,
    reset: contentGenerator.reset,

    // النتائج والوظائف المساعدة
    formatOutput: contentGenerator.formatOutput,
    validateInput: contentGenerator.validateInput,
    getProgressSteps: contentGenerator.getProgressSteps,

    // الطفرة (للتوافق مع الكود الموجود)
    mutation: contentGenerator.mutation,
  };
}
