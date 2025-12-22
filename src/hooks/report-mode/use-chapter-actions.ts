
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast, useBrowserSpeech } from '@/hooks';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { DiffPart, computeDiff } from '@/lib/utils/diff';
import { useBuilderStore } from '../core/useBuilderStore';
import { Chapter, SectionContext, ManipulationType } from '@/lib/models';
import { useLocalization } from '@/context/LocalizationContext';

const formSchema = z.object({
  rewriteStyle: z.string().optional(),
  targetAudience: z.string().optional(),
  tone: z.string().optional(),
  targetLevel: z.string().optional(),
  targetReduction: z.number().optional(),
  focusAreas: z.array(z.string()).optional(), // Changed to array of strings
});


type FormValues = z.infer<typeof formSchema>;

export function useChapterActions(chapter: Chapter | null, onOpenChange?: (open: boolean) => void) {
  const { t } = useLocalization();
  const { project, updateProject } = useBuilderStore();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'result' | 'diff'>('result');
  const [manipulationType, setManipulationType] = useState<ManipulationType>('rewrite');
  const [compressionRatio, setCompressionRatio] = useState(50);
  const [diff, setDiff] = useState<DiffPart[] | null>(null);
  const [context, setContext] = useState<SectionContext>({ sections: {}, externalContext: {} });
  const [isCopied, setIsCopied] = useState(false);

  const { speak, stop, isSpeaking } = useBrowserSpeech();
  
  const chapterContent = useMemo(() => {
    if (!chapter) return '';
    return chapter.sections.map(s => `# ${s.title}\n\n${s.content || ''}`).join('\n\n---\n\n');
  }, [chapter]);


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
  
  const translateMutation = useWritingTool('/api/writing-tools/translate-text');

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
    if(onOpenChange) onOpenChange(false);
  };

  const handleCopy = useCallback(() => {
    if (!chapterContent) return;
    navigator.clipboard.writeText(chapterContent).then(() => {
        setIsCopied(true);
        toast({ title: 'Chapter content copied!' });
        setTimeout(() => setIsCopied(false), 2000);
    });
  }, [chapterContent, toast]);

  const handleDuplicate = useCallback(() => {
    if (!chapter) return;
    updateProject(p => p.addChapter(`${chapter.title} (Copy)`, chapter.sections));
    toast({ title: 'Chapter Duplicated' });
  }, [chapter, updateProject, toast]);
  
  const handleTranslate = useCallback(() => {
    if (!chapterContent) return;
    const targetLang = /[\u0600-\u06FF]/.test(chapterContent) ? 'en' : 'ar';
    translateMutation.mutate({ text: chapterContent, targetLang }, {
        onSuccess: (data: any) => {
            const translatedContent = data.text;
            updateProject(p => p.addChapter(`${chapter.title} (Translated)`, [], translatedContent));
            toast({ title: 'Chapter Translated', description: 'A new chapter with the translated content has been created.' });
        },
        onError: (error) => {
            toast({ title: 'Translation Failed', description: error.message, variant: 'destructive' });
        }
    });
  }, [chapterContent, chapter, translateMutation, updateProject, toast]);

  const handleReadAloud = useCallback(() => {
    if (!chapterContent) return;
    if (isSpeaking) {
        stop();
    } else {
        speak(chapterContent);
    }
  }, [chapterContent, isSpeaking, speak, stop]);

  return {
    t,
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
    // New actions
    handleCopy,
    handleDuplicate,
    handleTranslate,
    handleReadAloud,
    isCopied,
    isTranslating: translateMutation.isPending,
    isSpeaking,
    isDuplicating: false, // Placeholder, implement if async
  };
}
