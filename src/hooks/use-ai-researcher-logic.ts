
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { AIResearcherOutput } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { toast, useProjects, useToast, useWritingTool } from '@/hooks';
import { addContextToProjectApi } from '@/services';
import { projectKeys } from '@/lib/query-keys';

const researcherSchema = z.object({
  topic: z.string().min(3, 'Please enter a topic to research.'),
});

type ResearcherFormValues = z.infer<typeof researcherSchema>;

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

export function useAIResearcherLogic() {
  const { t } = useLocalization();
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isAddToProjectOpen, setIsAddToProjectOpen] = useState(false);

  const mutation = useWritingTool('ai-researcher', {
    onError: (error) => {
      toast({ title: t('writingTools.aiResearcher.toastResearchFailed'), description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<ResearcherFormValues>({
    resolver: zodResolver(researcherSchema),
    defaultValues: { topic: '' },
  });

  const onSubmit = (data: ResearcherFormValues) => {
    mutation.mutate({ topic: data.topic });
  };

  const results = mutation.data as AIResearcherOutput | undefined;
  const markdownResult = results ? formatResearchToMarkdown(results, form.getValues('topic')) : '';

  const handleCopyToClipboard = () => {
    if (!markdownResult) return;
    navigator.clipboard.writeText(markdownResult);
    toast({ title: t('writingTools.aiResearcher.toastCopied') });
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return {
    t,
    form,
    mutation,
    onSubmit,
    results,
    markdownResult,
    reportRef,
    isCopied,
    isAddToProjectOpen,
    setIsAddToProjectOpen,
    handleCopyToClipboard,
  };
}

export function useAddToProjectDialogLogic(researchMarkdown: string, researchTitle: string, onOpenChange: (open: boolean) => void) {
  const { data: projects, isLoading, isError } = useProjects(); // Changed to use data from useProjects
  const queryClient = useQueryClient();
  const { t } = useLocalization();
  const { toast } = useToast();

  const mutation = useMutation<any, Error, { projectId: string; contextFile: any; }>({ // Added explicit types
    mutationFn: addContextToProjectApi,
    onSuccess: (data, variables) => {
      // Invalidate specific project query to refresh its context
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
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

  const handleSelectProject = (projectId: string) => {
    const fileName = `${researchTitle.slice(0, 30).replace(/\s+/g, '_')}_research.md`;
    // No longer need to manually handle the token
    mutation.mutate({ projectId, contextFile: { fileName, content: researchMarkdown, type: 'context' } });
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
