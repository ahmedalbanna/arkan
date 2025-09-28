

'use client';

import { SectionName } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { createReportToolHook } from '@/core';
import { getAuthenticatedToken } from '@/lib/authUtils';
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
    apiEndpoint: '/api/generate-report-section',
    schema: reportGenerationSchema,
    defaultValues,
    successMessage: 'Report section generated successfully!',
    errorMessage: 'Failed to generate report section',
    enableFileUpload: false,
    reportType: 'academic',
    customFeatures: {
      formatOutput: (data: any) => {
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
      validateInput: (data: any) => {
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
      const content = Object.values(data)[0] as string;

      // Use the new updater function for safe and centralized state updates
      updateProject(p => {
        p.updateSectionContent(sectionKey, content);
      });

      refetchUser(); // To update credits
    },
    onError: (error: Error, variables) => {
      const item = variables.body.sectionToGenerate;
      toast({ title: `Failed to generate "${item}"`, description: error.message, variant: "destructive" });
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
    handleCopy: reportTool.copyToClipboard,

    // المعالجة
    onSubmit: reportTool.handleSubmit,
    reset: reportTool.reset,

    // النتائج والوظائف المساعدة
    formatOutput: reportTool.formatOutput,
    validateInput: reportTool.validateInput,
    getReportSections: reportTool.getReportSections,

    // الطفرة (للتوافق مع الكود الموجود)
    mutation,
  };
}
