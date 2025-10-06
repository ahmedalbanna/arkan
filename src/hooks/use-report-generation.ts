

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

      // Handle different response formats safely
      let content: string;

      // Check if data is a string (direct content)
      if (typeof data === 'string') {
        content = data;
      }
      // Check if data has a 'data' property with section content
      else if (data && typeof data === 'object' && data.data && data.data[sectionKey]) {
        content = data.data[sectionKey];
      }
      // Check if data has the section key as a property
      else if (data && typeof data === 'object' && data[sectionKey]) {
        content = data[sectionKey];
      }
      // Check if data has a 'content' property
      else if (data && typeof data === 'object' && data.content) {
        content = data.content;
      }
      // Check if data is an object with section name as key (like {"abstract": "content"})
      else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        const firstKey = Object.keys(data)[0];
        const firstValue = data[firstKey];

        // If the value is a string, use it directly
        if (typeof firstValue === 'string') {
          content = firstValue;
        }
        // If the value is an object with content property
        else if (firstValue && typeof firstValue === 'object' && firstValue.content) {
          content = firstValue.content;
        }
        // Otherwise, stringify the value
        else {
          content = JSON.stringify(firstValue, null, 2);
        }
      }
      else {
        console.error('Unexpected response format:', data);
        return;
      }

      console.log('Extracted content:', content); // Debug log

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
