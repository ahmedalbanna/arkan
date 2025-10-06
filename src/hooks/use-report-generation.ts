

'use client';

import { SectionName } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { createReportToolHook } from '@/core';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { cleanExtractedContent, createDetailedErrorMessage, extractContentFromResponse, validateApiResponse } from '@/lib/utils/response-extractor';
import { generateReportSectionApi } from '@/services';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from './use-toast';
import { useBuilderStore } from './useBuilderStore';

// مخطط التحقق من البيانات
const reportGenerationSchema = z.object({
  sectionToGenerate: z.string().min(1, 'Please select a section to generate.'),
  projectContext: z.string().optional(),
  additionalRequirements: z.string().optional(),
});

// القيم الافتراضية
const defaultValues = {
  sectionToGenerate: '',
  projectContext: '',
  additionalRequirements: '',
};

/**
 * Hook محسن لتوليد أقسام التقارير
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useGenerateReportSection() {
  const { firebaseUser, refetchUser } = useAuth();
  const { updateProject } = useBuilderStore();

  const reportTool = createReportToolHook({
    toolName: 'report-section-generator',
    apiEndpoint: '/api/generate/report',
    schema: reportGenerationSchema,
    defaultValues,
    successMessage: 'Report section generated successfully!',
    errorMessage: 'Failed to generate report section',
    enableFileUpload: false,
    reportType: 'technical',
    customFeatures: {
      formatReportOutput: (data: any) => {
        if (data.content) {
          return {
            content: data.content,
            metadata: {
              sectionType: data.sectionType || 'unknown',
              wordCount: data.content.split(' ').length,
              quality: data.quality || 'good',
              citations: data.citations || [],
            }
          };
        }
        return data;
      },
      validateReportStructure: (data: any) => {
        return data.sectionToGenerate?.length > 0;
      },
      getReportSections: () => [
        'Introduction',
        'Literature Review',
        'Methodology',
        'Results',
        'Discussion',
        'Conclusion',
        'References'
      ]
    }
  })();

  const mutation = useMutation({
    mutationFn: async (variables: { body: any }) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return generateReportSectionApi(variables.body, token);
    },
    onSuccess: (data, variables) => {
      const sectionKey = variables.body.sectionToGenerate as SectionName;

      console.log('Raw API response:', data); // Debug log

      try {
        // التحقق من صحة الاستجابة قبل المعالجة
        if (!validateApiResponse(data, sectionKey)) {
          throw new Error('Invalid or empty response from server');
        }

        // استخراج المحتوى باستخدام الدالة المبسطة
        const extractedResult = extractContentFromResponse(data, sectionKey);

        // تنظيف المحتوى المستخرج
        const cleanedContent = cleanExtractedContent(extractedResult.content);

        console.log('Extracted content:', cleanedContent); // Debug log
        console.log('Content metadata:', extractedResult.metadata); // Debug log

        // تحديث حالة المشروع بالمحتوى المنظف
        updateProject(p => {
          p.updateSectionContent(sectionKey, cleanedContent);
        });

        // إظهار رسالة نجاح مع معلومات إضافية
        const wordCount = extractedResult.metadata?.wordCount || cleanedContent.split(' ').length;
        toast({
          title: `Section "${sectionKey}" generated successfully!`,
          description: `${wordCount} words generated`,
          variant: "default"
        });

        refetchUser(); // تحديث الرصيد
      } catch (error) {
        console.error('Error processing response:', error);

        // إنشاء رسالة خطأ مفصلة
        const errorMessage = createDetailedErrorMessage(
          error instanceof Error ? error : new Error('Unknown error'),
          sectionKey,
          data
        );

        toast({
          title: `Failed to process "${sectionKey}" response`,
          description: errorMessage,
          variant: "destructive"
        });
      }
    },
    onError: (error: Error, variables) => {
      const sectionKey = variables.body.sectionToGenerate as SectionName;

      // إنشاء رسالة خطأ محسنة
      const errorMessage = createDetailedErrorMessage(error, sectionKey);

      toast({
        title: `Failed to generate "${sectionKey}"`,
        description: errorMessage,
        variant: "destructive"
      });

      console.error(`Report generation error for ${sectionKey}:`, error);
    },
  });

  return {
    // النموذج والحالة
    form: reportTool.form,
    isProcessing: reportTool.isProcessing || mutation.isPending,

    // النصوص والمحتوى
    originalText: reportTool.originalText,
    processedText: reportTool.processedText,
    reportContent: reportTool.reportContent,

    // النسخ
    isCopied: reportTool.isCopied,
    handleCopy: reportTool.handleCopy,

    // المعالجة
    onSubmit: reportTool.onSubmit,
    reset: reportTool.reset,

    // النتائج والوظائف المساعدة
    formatOutput: reportTool.formatReportOutput,
    validateInput: reportTool.validateReportStructure,
    getReportSections: reportTool.getReportSections,

    // الطفرة (للتوافق مع الكود الموجود)
    mutation,
  };
}
