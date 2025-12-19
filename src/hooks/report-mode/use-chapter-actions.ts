
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { useState, useMemo, useEffect } from 'react';
import { DiffPart, computeDiff } from '@/lib/utils/diff';
import { useBuilderStore } from '../core/useBuilderStore';
import { Chapter } from '@/lib/models';
import type { ManipulationType, AnalysisType } from '@/lib/models';
import { text } from 'stream/consumers';

const formSchema = z.object({
  rewriteStyle: z.string().optional(),
  question: z.string().optional(),
  factQuery: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function useChapterActions(chapter: Chapter | null, onOpenChange: (open: boolean) => void) {
  const { updateProject } = useBuilderStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'manipulation' | 'analysis'>('manipulation');
  const [activeView, setActiveView] = useState<'result' | 'diff'>('result');
  const [manipulationType, setManipulationType] = useState<ManipulationType>('rewrite');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('custom-analysis');
  const [compressionRatio, setCompressionRatio] = useState(50);
  const [diff, setDiff] = useState<DiffPart[] | null>(null);

  const chapterContent = useMemo(() => {
    if (!chapter) return '';
    return chapter.sections.map(s => `# ${s.title}\n\n${s.content || ''}`).join('\n\n---\n\n');
  }, [chapter]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rewriteStyle: 'Formal',
      question: '',
      factQuery: '',
    },
  });

  const manipulationMutation = useWritingTool('/api/writing-tools/manipulate-text', {
    onSuccess: (data: any) => {
      const resultText = data.rewrittenText || '';
      setDiff(computeDiff(chapterContent, resultText));
    },
    onError: (error) => {
      toast({ title: 'Action Failed', description: error.message, variant: 'destructive' });
    }
  });
  
  const analysisMutation = useWritingTool('/api/writing-tools/question-answering', {
      onSuccess: (data: any) => {
          const resultText = data.answer || JSON.stringify(data, null, 2);
          setDiff(computeDiff(chapterContent, resultText))
      },
      onError: (error) => {
          toast({ title: 'Analysis Failed', description: error.message, variant: 'destructive' });
      }
  })

  useEffect(() => {
    // When switching top-level tabs, clear previous results
    setDiff(null);
    manipulationMutation.reset();
    analysisMutation.reset();
  }, [activeTab]);

  const onSubmit = (data: FormValues) => {
      if (activeTab === 'manipulation') {
          let command: string;
          switch (manipulationType) {
              case 'rewrite':
                  command = `Rewrite this entire document in a ${data.rewriteStyle || 'neutral'} style, preserving the chapter and section structure.`;
                  break;
              case 'summarize':
                  command = `Summarize this entire document to about ${compressionRatio}% of its original length, keeping the main chapter and section headings.`;
                  break;
              default:
                  command = 'Improve the overall style and flow of this document.';
          }
          manipulationMutation.mutate({ textToManipulate: chapterContent, command });
      } else { // Analysis
          let payload: any = { context: chapterContent };
           switch (analysisType) {
              case 'question-answering':
                  payload.question = data.question;
                  payload.useWebSearch = true;
                  break;
              case 'fact-retrieval':
                  payload.factQuery = data.factQuery;
                  payload.useWebSearch = true;
                  payload.requireSource = true;
                  break;
              default:
                  // For 'custom-analysis', the prompt is constructed differently or taken from elsewhere
                  toast({ title: 'Not implemented', description: 'Custom analysis from chapter tools is not yet implemented.'});
                  return;
           }
          analysisMutation.mutate(payload);
      }
  };
  
  const isProcessing = manipulationMutation.isPending || analysisMutation.isPending;
  const resultData = activeTab === 'manipulation' ? manipulationMutation.data : analysisMutation.data;
  let processedText = '';
  if (resultData) {
      if ('rewrittenText' in resultData) processedText = resultData.rewrittenText;
      else if ('answer' in resultData) processedText = resultData.answer;
      else if (typeof resultData === 'object') processedText = JSON.stringify(resultData, null, 2);
  }


  const manipulationTypes: { value: ManipulationType; label: string }[] = [
    { value: 'rewrite', label: 'Rewrite' },
    { value: 'summarize', label: 'Summarize' },
  ];
  
  const analysisTypes: { value: AnalysisType, label: string }[] = [
      { value: 'question-answering', label: 'Ask a Question' },
      { value: 'fact-retrieval', label: 'Retrieve a Fact' },
  ];

  const styles = ["Informal", "Friendly", "Simple", "Formal", "Professional", "Narrative", "Descriptive", "Expository", "Argumentative", "Persuasive", "Creative", "Technical", "Academic", "Journalistic", "Poetic", "Satirical", "Humorous"];

  const handleApplyToNewSection = () => {
    if (!chapter || !processedText) {
      toast({ title: 'No result to save', variant: 'destructive' });
      return;
    }
    
    let actionLabel = activeTab === 'manipulation' ? manipulationType : analysisType;

    const newSectionTitle = `${chapter.title} - ${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)}`;

    updateProject(p => {
      p.addSectionToChapter(chapter.id, newSectionTitle, processedText || '');
    });

    toast({ title: 'Section Added', description: `"${newSectionTitle}" has been added to the chapter.` });
    onOpenChange(false);
  };


  return {
    form,
    activeTab,
    setActiveTab,
    activeView,
    setActiveView,
    manipulationType,
    setManipulationType,
    manipulationTypes,
    analysisType,
    setAnalysisType,
    analysisTypes,
    styles,
    compressionRatio,
    setCompressionRatio,
    onSubmit,
    isProcessing,
    processedText,
    diff,
    handleApplyToNewSection,
  };
}
