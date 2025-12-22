'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { useState, useMemo, useEffect } from 'react';
import { DiffPart, computeDiff } from '@/lib/utils/diff';
import { useBuilderStore } from '../core/useBuilderStore';
import { Chapter, SectionContext, ManipulationType } from '@/lib/models';

const formSchema = z.object({
  rewriteStyle: z.string().optional(),
  targetAudience: z.string().optional(),
  tone: z.string().optional(),
  targetLevel: z.string().optional(),
  targetReduction: z.number().optional(),
  focusAreas: z.array(z.string()).optional(), // Changed to array of strings
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

  // When the dialog opens (and chapter is available), default the context
  useEffect(() => {
    if (chapter) {
      const defaultContext: SectionContext = { sections: {}, externalContext: {} };
      // Default all sections within this chapter to be selected
      chapter.sections.forEach(section => {
        defaultContext.sections[section.id] = true;
      });
      // For now, we are not including external context by default.
      setContext(defaultContext);
    }
  }, [chapter]);


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
      focusAreas: [],
    },
  });

  const mutation = useWritingTool('/api/writing-tools/text-stylist', {
    onSuccess: (data: any, variables) => {
      const resultText = data.rewrittenText || data.editedText || data.enhancedText || data.conciseText || data.improvedText || JSON.stringify(data, null, 2);
      const original = (variables as any).text;
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

    let payload: any = { text: textWithContext };

    switch (manipulationType) {
        case 'rewrite':
            payload.style = formData.rewriteStyle || 'neutral';
            break;
        case 'summarize':
             payload.ratio = compressionRatio;
             break;
        case 'style-editor':
            payload.targetAudience = formData.targetAudience;
            payload.tone = formData.tone;
            break;
        case 'readability-enhancer':
            payload.targetLevel = formData.targetLevel;
             break;
        case 'conciseness-checker':
             payload.targetReduction = formData.targetReduction;
             break;
        case 'clarity-advisor':
            payload.focusAreas = formData.focusAreas;
            break;
    }
    
    mutation.mutate(payload);
  };
  
  const isProcessing = mutation.isPending;
  const resultData = mutation.data as any;
  let processedText = '';
  if (resultData) {
      processedText = resultData.rewrittenText || resultData.summarizedText || resultData.editedText || resultData.enhancedText || resultData.conciseText || resultData.improvedText || JSON.stringify(resultData, null, 2);
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
    
    updateProject(p => p.addSectionToChapter(chapter.id, newSectionTitle, processedText));

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
