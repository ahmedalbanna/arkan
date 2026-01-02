
'use client';

import { useCallback, useMemo, useState } from 'react';
import { Editor } from '@tiptap/react';
import { useWritingTool } from '@/hooks';
import { useToast } from '@/hooks/util/use-toast';
import { useLocalization } from '@/context/LocalizationContext';
import { marked } from 'marked';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useBuilderStore } from '../core/useBuilderStore';
import { generateReportSectionApi } from '@/services/api/reportService';
import type { SectionName } from '@/ai/schemas';
import { PromptBuilder } from '@/lib/prompt-builder';
import { writingToolApi } from '@/services/api/writingToolsService';
import type { Chapter, Project } from '@/lib/models';
import { parseMarkdownToContent } from '../util/useMarkdownParser';

interface AiActionsProps {
  editor?: Editor | null;
}

export function useAiActions({ editor }: AiActionsProps = {}) {
  const { t } = useLocalization();
  const [activeAiAction, setActiveAiAction] = useState<string | null>(null);
  const { toast } = useToast();
  const { firebaseUser, refetchUser } = useAuth();
  const { updateProject } = useBuilderStore();

  const onTextUpdate = useCallback((newText: string, from: number, to: number) => {
    if (!editor) return;
    editor.chain().focus().insertContentAt({ from, to }, newText).run();
  }, [editor]);

  const onWholeUpdate = useCallback((newText: string) => {
    if (!editor) return;
    const html = marked.parse(newText) as string;
    editor.chain().focus().setContent(html).run();
  }, [editor]);

  const handleSuccess = (resultText: string) => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from !== to) {
      onTextUpdate(resultText, from, to);
    } else {
      onWholeUpdate(resultText);
    }
    toast({ title: t('builder.Section.aiActionComplete') });
  };

  const handleError = (error: Error) => {
    toast({
      title: t('builder.Section.aiActionFailed'),
      description: error.message,
      variant: 'destructive'
    });
  };

  const aiActionMutation = useWritingTool('/api/writing-tools/manipulate-text', {
    onSuccess: (data: any) => handleSuccess(data.rewrittenText),
    onError: handleError,
    onSettled: () => setActiveAiAction(null),
  });

  const translateMutation = useWritingTool('/api/writing-tools/translate-text', {
    onSuccess: (data: any) => handleSuccess(data.text),
    onError: handleError,
    onSettled: () => setActiveAiAction(null),
  });

  const isProcessing = aiActionMutation.isPending || translateMutation.isPending;

  const detectLanguage = (text: string): 'Arabic' | 'English' => {
    return /[؀-ۿ]/.test(text) ? 'Arabic' : 'English';
  };

  const handleAiAction = (action: string, payload: any = {}) => {
    if (!editor) return;
    setActiveAiAction(action);
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    const textToProcess = selectedText.trim() || editor.getText();

    if (!textToProcess) {
      toast({ title: t('builder.Section.noTextError'), variant: 'destructive' });
      setActiveAiAction(null);
      return;
    }

    if (action === 'translate') {
      const sourceLang = detectLanguage(textToProcess);
      const targetLang = sourceLang === 'Arabic' ? 'English' : 'Arabic';
      translateMutation.mutate({ text: textToProcess, targetLang });
      return;
    }

    const commandMap: Record<string, string> = {
      summarize: `Summarize this text concisely: "${textToProcess}"`,
      expand: `Expand on this topic, adding more detail and explanation: "${textToProcess}"`,
      grammar: `Correct any spelling and grammar mistakes in this text: "${textToProcess}"`,
      humanize: `Rewrite this text to sound more natural and human-like: "${textToProcess}"`,
      rewrite: `Rewrite this text in a ${payload.style || 'default'} style: "${textToProcess}"`
    };

    const command = commandMap[action];

    if (command) {
      aiActionMutation.mutate({ textToManipulate: textToProcess, command });
    } else {
      setActiveAiAction(null);
    }
  };

  const generateSectionMutation = useMutation({
    mutationKey: ['generateReportSection'],
    mutationFn: async (sectionId: string) => {
        const currentProject = useBuilderStore.getState().project;
        if (!currentProject || !firebaseUser) throw new Error("Project or user not found.");
        
        const section = currentProject.getSection(sectionId);
        if (!section) throw new Error("Section not found.");

        const token = await firebaseUser.getIdToken();
        const body = {
            sectionToGenerate: section.id as SectionName,
            prompt: section.buildActionPrompt(),
            otherSections: section.getContextAsRecord(currentProject),
            externalContext: section.getExternalContextAsArray(currentProject),
            guidelines: section.guidelines,
            instructionText: PromptBuilder.buildSectionPrompt(section, currentProject),
        };
        const result = await generateReportSectionApi(body, token);
        const content = result?.[section.id] ?? Object.values(result || {})[0] as string | undefined;
        if (!content) throw new Error('Empty generation result');
        return { sectionId: section.id, content };
    },
    onSuccess: (data) => {
        updateProject(p => p.updateSection(data.sectionId, s => s.with({ content: data.content })));
        refetchUser();
    },
    onError: (error: any) => {
        toast({ title: 'Section Generation Error', description: error.message || 'Failed to generate section', variant: 'destructive' });
    },
  });

  const generateChapterMutation = useMutation({
      mutationKey: ['generateChapterContent'],
      mutationFn: async (variables: { chapter: Chapter, project: Project, sectionsToBuild: any[] }) => {
        const { chapter, project, sectionsToBuild } = variables;
        if (!firebaseUser) throw new Error("User not found.");
        if (sectionsToBuild.length === 0) throw new Error('No sections selected.');

        const token = await firebaseUser.getIdToken();
        const body = {
            chapterTitle: chapter.title,
            sectionInstructions: sectionsToBuild.map(s => ({
              title: s.title, prompt: s.buildActionPrompt(), guidelines: s.guidelines,
              instructionText: PromptBuilder.buildSectionPrompt(s, project), context: ''
            }))
        };

        const result = await writingToolApi<any, { markdownContent: string }>(`/api/writing-tools/generate-chapter`, { data: body, token });
        return { chapterId: chapter.id, content: result.markdownContent };
    },
    onSuccess: (data) => {
        updateProject(p => {
            const parsedContent = parseMarkdownToContent(data.content, p.content);
            const newChapter = parsedContent[0];
            if (newChapter instanceof Chapter) {
                return p.updateChapter(data.chapterId, c => c.with({ sections: newChapter.sections }));
            }
            return p;
        });
        refetchUser();
        toast({ title: 'Chapter Generated', description: 'The AI has generated the content for the chapter.' });
    },
    onError: (error: any) => toast({ title: 'Chapter Generation Error', description: error.message, variant: 'destructive' })
  });

  const generateProjectMutation = useMutation({
      mutationKey: ['generateProjectContent'],
      mutationFn: async ({ project, selectedSectionIds }: { project: Project; selectedSectionIds: Set<string> }) => {
        if (!firebaseUser) throw new Error("User not found.");
        if (selectedSectionIds.size === 0) throw new Error('No sections were selected for generation.');
        
        for (const sectionId of selectedSectionIds) {
            await generateSectionMutation.mutateAsync(sectionId);
        }
    },
    onSuccess: () => toast({ title: "Project Build Complete", description: "All selected sections have been successfully generated." }),
    onError: (error: Error) => toast({ title: "Project Build Failed", description: error.message, variant: "destructive" }),
  });


  const rewriteStyles = useMemo(() => [
    { label: t('writingTools.textStylist.styles.formal'), style: 'Formal' },
    { label: t('writingTools.textStylist.styles.friendly'), style: 'Friendly' },
    { label: t('writingTools.textStylist.styles.simple'), style: 'Simple' },
    { label: t('writingTools.textStylist.styles.creative'), style: 'Creative' },
    { label: t('writingTools.textStylist.styles.professional'), style: 'Professional' },
    { label: t('writingTools.textStylist.styles.academic'), style: 'Academic' },
  ], [t]);

  return {
    activeAiAction,
    isProcessing,
    handleAiAction,
    rewriteStyles,
    generateSectionMutation,
    generateChapterMutation,
    generateProjectMutation,
  };
}
