'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useProjects, useToast } from '@/hooks';
import type { AIResearcherOutput } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addContextToProjectApi } from '@/services/project-service';
import { useAuth } from '@/context/AuthContext';
import { projectKeys } from '@/lib/query-keys';

const researcherSchema = z.object({
  topic: z.string().min(10, 'Please enter a more specific research topic.'),
});

type ResearcherFormValues = z.infer<typeof researcherSchema>;

function convertToMarkdown(results: AIResearcherOutput): string {
    let md = `# Research Report: ${results.summary.split('\n')[0]}\n\n`;
    md += `## Summary\n${results.summary}\n\n`;
    md += `## Key Points\n`;
    results.keyPoints.forEach(point => { md += `- ${point}\n`; });
    md += `\n## Sources\n`;
    results.sources.forEach(source => { md += `- ${source}\n`; });
    return md;
}

export function useAddToProjectDialogLogic(researchMarkdown: string, researchTitle: string, onOpenChange: (open: boolean) => void) {
  const { t } = useLocalization();
  const { data: projects, isLoading, isError } = useProjects();
  const { firebaseUser } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (variables: { projectId: string }) => {
        if (!firebaseUser) throw new Error("Not authenticated");
        const token = await firebaseUser.getIdToken();
        const fileName = `research_${researchTitle.slice(0, 20).replace(/\s/g, '_')}.md`;
        return addContextToProjectApi({
            projectId: variables.projectId,
            contextFile: { fileName, content: researchMarkdown, type: 'context' },
            token
        });
    },
    onSuccess: (data, variables) => {
        toast({
            title: t('writingTools.aiResearcher.toastContextAddedTitle'),
            description: t('writingTools.aiResearcher.toastContextAddedDesc', { researchTitle }),
        });
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
        onOpenChange(false);
    },
    onError: (error: Error) => {
        toast({
            title: t('writingTools.aiResearcher.toastContextFailedTitle'),
            description: error.message,
            variant: 'destructive'
        });
    }
  });

  const handleSelectProject = (projectId: string) => {
    mutation.mutate({ projectId });
  };

  return {
    t,
    projects,
    isLoading,
    isError,
    mutation,
    handleSelectProject,
  };
}

export function useAIResearcherLogic() {
  const { t } = useLocalization();
  const [isCopied, setIsCopied] = useState(false);
  const [isAddToProjectOpen, setIsAddToProjectOpen] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const mutation = useWritingTool('/api/writing-tools/ai-researcher', {
    onError: (error) => {
      toast({ title: t('writingTools.aiResearcher.toastResearchFailed'), description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<ResearcherFormValues>({
    resolver: zodResolver(researcherSchema),
    defaultValues: { topic: '' },
  });

  const onSubmit = (data: ResearcherFormValues) => {
    mutation.mutate(data);
  };

  const results = mutation.data as AIResearcherOutput | null;
  const markdownResult = useMemo(() => (results ? convertToMarkdown(results) : ''), [results]);

  const handleCopyToClipboard = () => {
    if (!markdownResult) return;
    navigator.clipboard.writeText(markdownResult);
    setIsCopied(true);
    toast({ title: t('writingTools.aiResearcher.toastCopied') });
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
