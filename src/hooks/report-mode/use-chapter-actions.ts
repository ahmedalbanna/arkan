
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { useState, useMemo, useEffect } from 'react';
import { DiffPart, computeDiff } from '@/lib/utils/diff';
import { useBuilderStore } from '../core/useBuilderStore';
import { Chapter } from '@/lib/models';
import type { ManipulationType } from '@/lib/models';

const formSchema = z.object({
  rewriteStyle: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function useChapterActions(chapter: Chapter | null, onOpenChange: (open: boolean) => void) {
  const { updateProject } = useBuilderStore();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'result' | 'diff'>('result');
  const [manipulationType, setManipulationType] = useState<ManipulationType>('rewrite');
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
    },
  });

  const mutation = useWritingTool('/api/writing-tools/manipulate-text', {
    onSuccess: (data: any) => {
      const resultText = data.rewrittenText || '';
      setDiff(computeDiff(chapterContent, resultText));
    },
    onError: (error) => {
      toast({ title: 'Action Failed', description: error.message, variant: 'destructive' });
    }
  });

  const processedText = (mutation.data as { rewrittenText: string })?.rewrittenText || '';

  useEffect(() => {
    // When switching manipulation type, clear previous results
    setDiff(null);
    mutation.reset();
  }, [manipulationType]);

  const onSubmit = (data: FormValues) => {
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
    mutation.mutate({ textToManipulate: chapterContent, command });
  };

  const manipulationTypes: { value: ManipulationType; label: string }[] = [
    { value: 'rewrite', label: 'Rewrite' },
    { value: 'summarize', label: 'Summarize' },
  ];

  const styles = ["Informal", "Friendly", "Simple", "Formal", "Professional", "Narrative", "Descriptive", "Expository", "Argumentative", "Persuasive", "Creative", "Technical", "Academic", "Journalistic", "Poetic", "Satirical", "Humorous"];

  const handleApplyToNewSection = () => {
    if (!chapter || !processedText) {
      toast({ title: 'No result to save', variant: 'destructive' });
      return;
    }

    const newSectionTitle = `${chapter.title} - ${manipulationType === 'rewrite' ? form.getValues('rewriteStyle') : 'Summary'}`;

    updateProject(p => {
      p.addSectionToChapter(chapter.id, newSectionTitle, processedText || '');
    });

    toast({ title: 'Section Added', description: `"${newSectionTitle}" has been added to the chapter.` });
    onOpenChange(false);
  };


  return {
    form,
    activeView,
    setActiveView,
    manipulationType,
    setManipulationType,
    manipulationTypes,
    styles,
    compressionRatio,
    setCompressionRatio,
    onSubmit,
    mutation,
    processedText,
    diff,
    isProcessing: mutation.isPending,
    handleApplyToNewSection,
  };
}
