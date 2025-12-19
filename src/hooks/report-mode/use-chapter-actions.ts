
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { useState, useMemo, useEffect } from 'react';
import { DiffPart, computeDiff } from '@/lib/utils/diff';
import { useBuilderStore } from '../core/useBuilderStore';
import { Chapter } from '@/lib/models';
import type { ManipulationType, ProcessingAction } from '@/lib/models';

const formSchema = z.object({
  rewriteStyle: z.string().optional(),
  sourceFileId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function useChapterActions(chapter: Chapter | null, onOpenChange: (open: boolean) => void) {
  const { project, updateProject } = useBuilderStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'manipulation' | 'processing'>('manipulation');
  const [activeView, setActiveView] = useState<'result' | 'diff'>('result');
  const [manipulationType, setManipulationType] = useState<ManipulationType>('rewrite');
  const [processingAction, setProcessingAction] = useState<ProcessingAction>('extract-text');
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
      sourceFileId: '',
    },
  });

  const getSourceContent = (sourceId: string | undefined): string => {
    if (!sourceId) return chapterContent; // Default to chapter content for manipulation/analysis
    const file = project?.externalContext.find(f => f.id === sourceId);
    return file?.content || '';
  };

  const mutation = useWritingTool('/api/writing-tools/manipulate-text', {
    onSuccess: (data: any) => {
      const resultText = data.rewrittenText || JSON.stringify(data, null, 2);
      const original = getSourceContent(form.getValues('sourceFileId'));
      setDiff(computeDiff(original, resultText));
    },
    onError: (error) => {
      toast({ title: 'Action Failed', description: error.message, variant: 'destructive' });
    }
  });

  useEffect(() => {
    // When switching top-level tabs, clear previous results
    setDiff(null);
    mutation.reset();
  }, [activeTab, mutation.reset]);


  const onSubmit = (data: FormValues) => {
    let command = '';
    let textToProcess = chapterContent;

    if (activeTab === 'manipulation') {
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
    } else if (activeTab === 'processing') {
        if (!data.sourceFileId) {
            toast({ title: 'No source file selected', description: 'Please select a document to process.', variant: 'destructive' });
            return;
        }
        textToProcess = getSourceContent(data.sourceFileId);
         switch (processingAction) {
            case 'extract-text':
                command = `Extract and clean the text from this document, formatting it as clean markdown.`;
                break;
            case 'summarize':
                command = `Provide a concise summary of this document.`;
                break;
            case 'translate':
                command = `Translate this document to Arabic.`;
                break;
        }
    }
    
    mutation.mutate({ textToManipulate: textToProcess, command });
  };
  
  const isProcessing = mutation.isPending;
  const resultData = mutation.data;
  let processedText = '';
  if (resultData) {
      if ('rewrittenText' in (resultData as any)) processedText = (resultData as any).rewrittenText;
      else if (typeof resultData === 'object') processedText = JSON.stringify(resultData, null, 2);
  }

  const manipulationTypes: { value: ManipulationType; label: string }[] = [
    { value: 'rewrite', label: 'Rewrite' },
    { value: 'summarize', label: 'Summarize' },
  ];
  
  const processingActions: { value: ProcessingAction, label: string}[] = [
      { value: 'extract-text', label: 'Extract & Clean Text'},
      { value: 'summarize', label: 'Summarize Document' },
      { value: 'translate', label: 'Translate Document' },
  ];

  const styles = ["Informal", "Friendly", "Simple", "Formal", "Professional", "Narrative", "Descriptive", "Expository", "Argumentative", "Persuasive", "Creative", "Technical", "Academic", "Journalistic", "Poetic", "Satirical", "Humorous"];

  const handleApplyToNewSection = () => {
    if (!chapter || !processedText) {
      toast({ title: 'No result to save', variant: 'destructive' });
      return;
    }
    
    let actionLabel = activeTab === 'manipulation' ? manipulationType : processingAction;
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
    processingAction,
    setProcessingAction,
    processingActions,
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
