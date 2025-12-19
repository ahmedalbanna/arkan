
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

export function useChapterActions(chapter: Chapter | null) {
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
      setDiff(computeDiff(chapterContent, data.processedText));
    },
    onError: (error) => {
      toast({ title: 'Action Failed', description: error.message, variant: 'destructive' });
    }
  });

  useEffect(() => {
    // When switching manipulation type, clear previous results
    setDiff(null);
    mutation.reset();
  }, [manipulationType, mutation]);

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
    diff,
    isProcessing: mutation.isPending,
  };
}
