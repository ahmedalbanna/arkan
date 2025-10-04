
'use client';

import type { AIResearcherOutput } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { createSpecializedToolHook } from '@/core';
import { useProjects } from '@/hooks';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { addContextToProjectApi } from '@/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { z } from 'zod';

// مخطط التحقق من البيانات
const researcherSchema = z.object({
  topic: z.string().min(3, 'Please enter a topic to research.'),
});

// القيم الافتراضية
const defaultValues = {
  topic: '',
};

// Helper function to format the research output as Markdown
export const formatResearchToMarkdown = (data: AIResearcherOutput, title: string): string => {
  let markdown = `# Research Report: ${title}\n\n`;
  markdown += `## Summary\n${data.summary}\n\n`;
  markdown += `## Key Points\n`;
  data.keyPoints.forEach(point => {
    markdown += `- ${point}\n`;
  });
  markdown += `\n### Sources\n`;
  data.sources.forEach(source => {
    markdown += `- [${source}](${source})\n`;
  });
  return markdown;
};

/**
 * Hook محسن لباحث الذكاء الاصطناعي
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useAIResearcherLogic() {
  const { t } = useLocalization();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isAddToProjectOpen, setIsAddToProjectOpen] = useState(false);

  const specializedTool = createSpecializedToolHook({
    toolName: 'ai-researcher',
    apiEndpoint: 'ai-researcher',
    schema: researcherSchema,
    defaultValues,
    successMessage: t('writingTools.aiResearcher.toastResearchSuccess') || 'Research completed successfully!',
    errorMessage: t('writingTools.aiResearcher.toastResearchFailed') || 'Research failed',
    enableFileUpload: false, // هذا الأداة لا تدعم رفع الملفات
    toolCategory: 'research',
    customFeatures: {
      formatOutput: (data: any) => {
        if (data.summary && data.keyPoints && data.sources) {
          return {
            summary: data.summary,
            keyPoints: data.keyPoints,
            sources: data.sources,
            metadata: {
              topic: data.topic,
              researchDepth: data.depth || 'medium',
              sourceCount: data.sources.length,
              keyPointCount: data.keyPoints.length,
              confidence: data.confidence || 0.8,
            }
          };
        }
        return data;
      },
      validateInput: (data: any) => {
        return data.topic?.length >= 3;
      },
      getProgressSteps: () => [
        'Analyzing research topic',
        'Gathering information',
        'Processing data',
        'Generating summary',
        'Extracting key points',
        'Collecting sources',
        'Finalizing research report'
      ]
    }
  })();

  // الحصول على النتائج من الطفرة
  const results = specializedTool.mutation.data as AIResearcherOutput | undefined;
  const markdownResult = results ? formatResearchToMarkdown(results, specializedTool.form.getValues('topic')) : '';

  // معالج النسخ المخصص للبحث
  const handleCopyToClipboard = () => {
    if (!markdownResult) return;
    specializedTool.copyToClipboard(markdownResult);
  };

  return {
    // الترجمة
    t,

    // النموذج والحالة
    form: specializedTool.form,
    isProcessing: specializedTool.isProcessing,

    // النصوص والمحتوى
    originalText: specializedTool.originalText,
    processedText: specializedTool.processedText,
    toolResult: specializedTool.toolResult,

    // النسخ
    isCopied: specializedTool.isCopied,
    handleCopyToClipboard,

    // المعالجة
    onSubmit: specializedTool.handleSubmit,
    reset: specializedTool.reset,

    // النتائج والوظائف المساعدة
    results,
    markdownResult,
    reportRef,
    isAddToProjectOpen,
    setIsAddToProjectOpen,
    formatOutput: specializedTool.formatOutput,
    validateInput: specializedTool.validateInput,
    getProgressSteps: specializedTool.getProgressSteps,

    // الطفرة (للتوافق مع الكود الموجود)
    mutation: specializedTool.mutation,
  };
}

export function useAddToProjectDialogLogic(researchMarkdown: string, researchTitle: string, onOpenChange: (open: boolean) => void) {
  const { projects, isLoading, isError } = useProjects();
  const { firebaseUser } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useLocalization();

  const mutation = useMutation({
    mutationFn: addContextToProjectApi,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId] });
      toast({
        title: t('writingTools.aiResearcher.toastContextAddedTitle'),
        description: t('writingTools.aiResearcher.toastContextAddedDesc').replace('{researchTitle}', researchTitle)
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({ title: t('writingTools.aiResearcher.toastContextFailedTitle'), description: error.message, variant: "destructive" });
    }
  });

  const handleSelectProject = async (projectId: string) => {
    const token = await getAuthenticatedToken(firebaseUser);
    const fileName = `${researchTitle.slice(0, 30).replace(/\s+/g, '_')}_research.md`;
    mutation.mutate({ projectId, contextFile: { fileName, content: researchMarkdown, type: 'context' }, token });
  };

  return {
    t,
    projects,
    isLoading,
    isError,
    mutation,
    handleSelectProject
  }
}
