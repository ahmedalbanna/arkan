
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { useState, useMemo } from 'react';
import { DiffPart, computeDiff } from '@/lib/utils/diff';
import { useBuilderStore } from '../core/useBuilderStore';
import { Chapter, SectionContext } from '@/lib/models';
import type { ManipulationType } from '@/lib/models';

const formSchema = z.object({
  rewriteStyle: z.string().optional(),
  targetAudience: z.string().optional(),
  tone: z.string().optional(),
  targetLevel: z.string().optional(),
  targetReduction: z.number().optional(),
  focusAreas: z.string().optional(), // Storing as string, will split later
});

type FormValues = z.infer<typeof formSchema>;

export function useChapterActions(chapter: Chapter | null, onOpenChange: (open: boolean) => void) {
  const { project, updateProject } = useBuilderStore();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'result' | 'diff'>('result');
  const [manipulationType, setManipulationType] = useState<ManipulationType>('rewrite');
  const [compressionRatio, setCompressionRatio] = useState(50);
  const [diff, setDiff] = useState<DiffPart[] | null>(null);
  const [context, setContext] = useState<SectionContext>({ sections: {}, externalContext: {} });

  const chapterContent = useMemo(() => {
    if (!chapter) return '';
    return chapter.sections.map(s => `# ${s.title}\n\n${s.content || ''}`).join('\n\n---\n\n');
  }, [chapter]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rewriteStyle: 'Formal',
      targetAudience: '',
      tone: '',
      targetLevel: 'high-school',
      targetReduction: 20,
      focusAreas: '',
    },
  });

  const mutation = useWritingTool('/api/writing-tools/manipulate-text', {
    onSuccess: (data: any, variables) => {
      const resultText = data.rewrittenText || JSON.stringify(data, null, 2);
      const original = variables.textToManipulate;
      setDiff(computeDiff(original, resultText));
    },
    onError: (error) => {
      toast({ title: 'Action Failed', description: error.message, variant: 'destructive' });
    }
  });

  const onSubmit = (formData: FormValues) => {
    const textToProcess = chapterContent;
    if (!textToProcess.trim()) {
        toast({ title: 'No content to process', description: 'The chapter has no content.', variant: 'destructive' });
        return;
    }

    const contextSectionsContent = Object.keys(context.sections || {})
        .filter(key => context.sections?.[key])
        .map(key => {
            const section = project?.getSection(key);
            return `--- Context from Section: ${section?.title} ---\n${section?.content}`;
        }).join('\n\n');

    const contextFilesContent = Object.keys(context.externalContext || {})
        .filter(key => context.externalContext?.[key])
        .map(key => {
            const file = project?.externalContext?.find(f => f.id === key);
            return `--- Context from File: ${file?.fileName} ---\n${file?.content}`;
        }).join('\n\n');
    
    const fullContext = [contextSectionsContent, contextFilesContent].filter(Boolean).join('\n\n');
    const textWithContext = `${textToProcess}\n\n${fullContext ? `--- Additional Context ---\n${fullContext}`: ''}`;

    let command = '';
    switch (manipulationType) {
        case 'rewrite':
            command = `Rewrite this entire document in a ${formData.rewriteStyle || 'neutral'} style, preserving the chapter and section structure.`;
            break;
        case 'summarize':
            command = `Summarize this entire document to about ${compressionRatio}% of its original length, keeping the main chapter and section headings.`;
            break;
        case 'style-editor':
            command = `Improve the writing style of the context text.`;
            if (formData.targetAudience) command += ` The target audience is ${formData.targetAudience}.`;
            if (formData.tone) command += ` The desired tone is ${formData.tone}.`;
            break;
        case 'readability-enhancer':
            command = `Enhance the readability of the context text. Target a ${formData.targetLevel || 'high-school'} reading level.`;
            break;
        case 'conciseness-checker':
             command = `Make the context text more concise, aiming for a ${formData.targetReduction || 20}% reduction in word count.`;
             break;
        case 'clarity-advisor':
            command = 'Improve the clarity of the context text.';
            if (formData.focusAreas) {
                command += ` Focus on these areas: ${formData.focusAreas}.`;
            }
            break;
        default:
            command = 'Improve the overall style and flow of this document.';
    }
    
    mutation.mutate({ textToManipulate: textWithContext, command });
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
    { value: 'style-editor', label: 'Improve Style' },
    { value: 'readability-enhancer', label: 'Enhance Readability' },
    { value: 'conciseness-checker', label: 'Make Concise' },
    { value: 'clarity-advisor', label: 'Improve Clarity' },
  ];
  
  const styles = ["Informal", "Friendly", "Simple", "Formal", "Professional", "Narrative", "Descriptive", "Expository", "Argumentative", "Persuasive", "Creative", "Technical", "Academic", "Journalistic", "Poetic", "Satirical", "Humorous"];

  const handleApplyToNewSection = () => {
    if (!chapter || !processedText) {
      toast({ title: 'No result to save', variant: 'destructive' });
      return;
    }
    
    const newSectionTitle = `${chapter.title} - ${manipulationType.charAt(0).toUpperCase() + manipulationType.slice(1)}`;

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
    isProcessing,
    processedText,
    diff,
    handleApplyToNewSection,
    context,
    setContext,
  };
}
