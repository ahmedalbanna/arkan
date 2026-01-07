
'use client';

import type { AIResearcherOutput, FactRetrievalOutput, LiteratureReviewOutput, QuestionAnsweringOutput } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { useToast } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useBuilderStore } from '../core/useBuilderStore';
import { useWritingTool } from './use-writing-tool';

export type ResearchMode = 'ai-researcher' | 'literature-review' | 'question-answering' | 'fact-retrieval';

const researcherSchema = z.object({
  topic: z.string().min(10, 'Please enter a more specific research topic.'),
  depth: z.enum(['basic', 'comprehensive', 'in-depth']).optional(),
});

const literatureReviewSchema = z.object({
  topic: z.string().min(10, 'Please enter a more specific topic.'),
  focusAreas: z.string().optional(),
  numberOfSources: z.number().int().min(5).max(50).optional(),
  timeRange: z.string().optional(),
});

const questionAnsweringSchema = z.object({
  question: z.string().min(10, 'Please enter a question.'),
  context: z.string().optional(),
  useWebSearch: z.boolean().optional().default(false),
  maxSources: z.number().int().min(1).max(10).optional(),
});

const factRetrievalSchema = z.object({
  factQuery: z.string().min(5, 'Please enter a fact query.'),
  useWebSearch: z.boolean().optional().default(true),
  requireSource: z.boolean().optional().default(true),
});

type ResearcherFormValues = z.infer<typeof researcherSchema>;
type LiteratureReviewFormValues = z.infer<typeof literatureReviewSchema>;
type QuestionAnsweringFormValues = z.infer<typeof questionAnsweringSchema>;
type FactRetrievalFormValues = z.infer<typeof factRetrievalSchema>;

type ResearchFormValues = ResearcherFormValues | LiteratureReviewFormValues | QuestionAnsweringFormValues | FactRetrievalFormValues;

function convertToMarkdown(
  results: AIResearcherOutput | LiteratureReviewOutput | QuestionAnsweringOutput | FactRetrievalOutput,
  mode: ResearchMode
): string {
  switch (mode) {
    case 'ai-researcher': {
      const r = results as AIResearcherOutput;
      let md = `# Research Report\n\n`;
      md += `## Summary\n${r.summary}\n\n`;
      if (r.methodology) {
        md += `## Methodology\n${r.methodology}\n\n`;
      }
      md += `## Key Points\n`;
      r.keyPoints.forEach(point => { md += `- ${point}\n`; });
      if (r.findings && r.findings.length > 0) {
        md += `\n## Findings\n`;
        r.findings.forEach(finding => { md += `- ${finding}\n`; });
      }
      md += `\n## Sources\n`;
      r.sources.forEach(source => { md += `- ${source}\n`; });
      return md;
    }
    case 'literature-review': {
      const r = results as LiteratureReviewOutput;
      let md = `# Literature Review\n\n`;
      md += `## Introduction\n${r.introduction}\n\n`;
      md += `## Main Body\n${r.mainBody}\n\n`;
      md += `## Conclusion\n${r.conclusion}\n\n`;
      if (r.gaps && r.gaps.length > 0) {
        md += `## Gaps in Literature\n`;
        r.gaps.forEach(gap => { md += `- ${gap}\n`; });
        md += `\n`;
      }
      md += `## Sources\n`;
      r.sources.forEach(source => {
        md += `### ${source.title}\n`;
        md += `- **URL:** ${source.url}\n`;
        md += `- **Summary:** ${source.summary}\n`;
        md += `- **Relevance:** ${source.relevance}\n\n`;
      });
      return md;
    }
    case 'question-answering': {
      const r = results as QuestionAnsweringOutput;
      let md = `# Question & Answer\n\n`;
      md += `## Answer\n${r.answer}\n\n`;
      md += `**Confidence:** ${r.confidence}\n`;
      md += `**Context Used:** ${r.contextUsed ? 'Yes' : 'No'}\n\n`;
      if (r.sources && r.sources.length > 0) {
        md += `## Sources\n`;
        r.sources.forEach(source => {
          md += `- [${source.title || source.url}](${source.url})`;
          if (source.relevance) md += ` - ${source.relevance}`;
          md += `\n`;
        });
        md += `\n`;
      }
      if (r.additionalNotes) {
        md += `## Additional Notes\n${r.additionalNotes}\n`;
      }
      return md;
    }
    case 'fact-retrieval': {
      const r = results as FactRetrievalOutput;
      let md = `# Fact Retrieval\n\n`;
      md += `## Fact\n${r.fact}\n\n`;
      md += `**Confidence:** ${r.confidence}\n`;
      if (r.source) {
        md += `**Source:** [${r.sourceTitle || r.source}](${r.source})\n`;
      }
      if (r.lastVerified) {
        md += `**Last Verified:** ${r.lastVerified}\n`;
      }
      md += `\n`;
      if (r.relatedFacts && r.relatedFacts.length > 0) {
        md += `## Related Facts\n`;
        r.relatedFacts.forEach(fact => { md += `- ${fact}\n`; });
      }
      return md;
    }
    default:
      return '';
  }
}

export function useAddToProjectDialogLogic(researchMarkdown: string, researchTitle: string, onOpenChange: (open: boolean) => void) {
  const { t } = useLocalization();
  const { updateProject } = useBuilderStore();
  const { toast } = useToast();

  const handleSelectProject = () => {
    try {
      const fileName = `research_${researchTitle.slice(0, 20).replace(/\s/g, '_')}.md`;
      updateProject(p => p.addExternalContext({
        fileName: fileName,
        content: researchMarkdown,
        type: 'context'
      }));
      toast({
        title: t('writingTools.aiResearcher.toastContextAddedTitle'),
        description: t('writingTools.aiResearcher.toastContextAddedDesc', { researchTitle }),
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: t('writingTools.aiResearcher.toastContextFailedTitle'),
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // The rest of the original hook is no longer needed as we're not selecting from a list of projects.
  return {
    t,
    projects: [], // Return empty array to satisfy component props
    isLoading: false,
    isError: false,
    mutation: { isPending: false }, // Mock mutation state
    handleSelectProject,
  };
}


export function useAIResearcherLogic() {
  const { t } = useLocalization();
  const [isCopied, setIsCopied] = useState(false);
  const [isAddToProjectOpen, setIsAddToProjectOpen] = useState(false);
  const [researchMode, setResearchMode] = useState<ResearchMode>('ai-researcher');
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const getApiEndpoint = (mode: ResearchMode) => {
    switch (mode) {
      case 'ai-researcher':
        return 'ai-researcher';
      case 'literature-review':
        return 'literature-review';
      case 'question-answering':
        return 'question-answering';
      case 'fact-retrieval':
        return 'fact-retrieval';
      default:
        return 'ai-researcher';
    }
  };

  const getSchema = (mode: ResearchMode) => {
    switch (mode) {
      case 'ai-researcher':
        return researcherSchema;
      case 'literature-review':
        return literatureReviewSchema;
      case 'question-answering':
        return questionAnsweringSchema;
      case 'fact-retrieval':
        return factRetrievalSchema;
      default:
        return researcherSchema;
    }
  };

  const mutation = useWritingTool(getApiEndpoint(researchMode), {
    onError: (error) => {
      toast({ title: t('writingTools.aiResearcher.toastResearchFailed'), description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<any>({
    resolver: zodResolver(getSchema(researchMode)),
    defaultValues: { topic: '', question: '', factQuery: '', useWebSearch: false, requireSource: true },
  });

  // Reset form when research mode changes
  useEffect(() => {
    form.reset({ topic: '', question: '', factQuery: '', useWebSearch: false, requireSource: true, depth: 'comprehensive' });
    form.clearErrors();
  }, [researchMode, form]);

  const onSubmit = (data: any) => {
    // Transform form data based on mode
    let payload: any = {};
    if (researchMode === 'ai-researcher') {
      payload = { topic: data.topic, depth: data.depth };
    } else if (researchMode === 'literature-review') {
      payload = {
        topic: data.topic,
        focusAreas: data.focusAreas ? data.focusAreas.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        numberOfSources: data.numberOfSources,
        timeRange: data.timeRange,
      };
    } else if (researchMode === 'question-answering') {
      payload = {
        question: data.question,
        context: data.context,
        useWebSearch: data.useWebSearch || false,
        maxSources: data.maxSources,
      };
    } else if (researchMode === 'fact-retrieval') {
      payload = {
        factQuery: data.factQuery,
        useWebSearch: data.useWebSearch !== false,
        requireSource: data.requireSource !== false,
      };
    }
    mutation.mutate(payload);
  };

  const results = mutation.data as AIResearcherOutput | LiteratureReviewOutput | QuestionAnsweringOutput | FactRetrievalOutput | null;
  const markdownResult = useMemo(() => (results ? convertToMarkdown(results, researchMode) : ''), [results, researchMode]);

  const handleCopyToClipboard = () => {
    if (!markdownResult) return;
    navigator.clipboard.writeText(markdownResult);
    setIsCopied(true);
    toast({ title: t('writingTools.aiResearcher.toastCopied') });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getTitle = () => {
    if (researchMode === 'ai-researcher') return form.getValues('topic' as any);
    if (researchMode === 'literature-review') return form.getValues('topic' as any);
    if (researchMode === 'question-answering') return form.getValues('question' as any);
    if (researchMode === 'fact-retrieval') return form.getValues('factQuery' as any);
    return '';
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
    researchMode,
    setResearchMode,
    getTitle,
  };
}
