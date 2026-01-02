
'use client';

import { useCallback, useMemo, useState } from 'react';
import { Editor } from '@tiptap/react';
import { useWritingTool } from '@/hooks';
import { useToast } from '@/hooks/util/use-toast';
import { useLocalization } from '@/context/LocalizationContext';
import { marked } from 'marked';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Chapter, Project, Section } from '@/lib/models';
import { PromptBuilder } from '@/lib/prompt-builder';
import { writingToolApi } from '@/services/api/writingToolsService';
import { generateReportSectionApi } from '@/services/api/reportService';
import { toast as Toaster } from '@/hooks';
import { useBuilderStore } from '../core/useBuilderStore';
import type { SectionName } from '@/ai/schemas';

interface AiActionsProps {
  editor?: Editor | null;
}

export function useAiActions({ editor }: AiActionsProps = {}) {
  const { t } = useLocalization();
  const { project, updateProject } = useBuilderStore();
  const { firebaseUser, refetchUser } = useAuth();
  const [activeAiAction, setActiveAiAction] = useState<string | null>(null);

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
    Toaster({ title: t('builder.Section.aiActionComplete') });
  };

  const handleError = (error: Error) => {
    Toaster({
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

  const sectionMutation = useMutation({
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
        // Individual toast is handled by the orchestrator (projectMutation)
    },
    onError: (error: any) => {
        Toaster({ title: 'Section Generation Error', description: error.message || 'Failed to generate section', variant: 'destructive' });
        // Propagate the error so the orchestrator can stop
        throw error;
    },
  });
  
  const getContextNames = (section: Section, project: Project): string[] => {
    if (!section) return []; // Guard clause to prevent crash
    const sectionContexts = Object.keys(section.context?.sections || {})
      .filter(key => section.context.sections?.[key])
      .map(key => project.getSection(key)?.title)
      .filter(Boolean) as string[];

    const fileContexts = Object.keys(section.context?.externalContext || {})
      .filter(key => section.context.externalContext?.[key])
      .map(key => project.externalContext.find(f => f.id === key)?.fileName)
      .filter(Boolean) as string[];

    return [...sectionContexts, ...fileContexts];
  };

  const chapterMutation = useMutation({
    mutationKey: ['generateChapterContent'],
    mutationFn: async (variables: { chapter: Chapter, project: Project, sectionsToBuild: Section[] }) => {
        const { chapter, project, sectionsToBuild } = variables;
        if (!firebaseUser) throw new Error("User not found.");
        if (sectionsToBuild.length === 0) throw new Error('No sections selected.');

        const token = await firebaseUser.getIdToken();
        const body = {
            chapterTitle: chapter.title,
            sectionInstructions: sectionsToBuild.map(s => ({
              title: s.title, prompt: s.buildActionPrompt(), guidelines: s.guidelines,
              instructionText: PromptBuilder.buildSectionPrompt(s, project), context: getContextNames(s, project).join(', ')
            }))
        };

        const result = await writingToolApi<any, { markdownContent: string }>(`/api/writing-tools/generate-chapter`, { data: body, token });
        return { chapterId: chapter.id, content: result.markdownContent, sectionsToBuild };
    },
    onSuccess: (data) => {
        updateProject(p => {
            let updatedProject = p;
            updatedProject = updatedProject.updateSection(data.sectionsToBuild[0].id, s => s.with({ content: data.content }));
            for (let i = 1; i < data.sectionsToBuild.length; i++) {
                updatedProject = updatedProject.updateSection(data.sectionsToBuild[i].id, s => s.with({ content: '' }));
            }
            return updatedProject;
        });
        refetchUser();
        Toaster({ title: 'Chapter Generated', description: 'The AI has generated the content for the chapter.' });
    },
    onError: (error: any) => Toaster({ title: 'Chapter Generation Error', description: error.message, variant: 'destructive' })
  });

  const projectMutation = useMutation({
    mutationKey: ['generateProjectContent'],
    mutationFn: async ({ project, selectedSectionIds }: { project: Project; selectedSectionIds: Set<string> }) => {
      if (!firebaseUser) throw new Error("User not found.");
      if (selectedSectionIds.size === 0) {
        throw new Error('No sections were selected for generation.');
      }
      
      const totalSections = selectedSectionIds.size;
      let generatedCount = 0;
      let lastToastId: string | undefined;

      for (const sectionId of selectedSectionIds) {
        try {
          await sectionMutation.mutateAsync(sectionId);
          generatedCount++;
          const toastMessage = `Generated ${generatedCount} of ${totalSections} sections...`;
          if (lastToastId) {
            Toaster.dismiss(lastToastId);
          }
          const { id } = Toaster({ title: 'Generation in Progress', description: toastMessage });
          lastToastId = id;

        } catch (error) {
          // The error is already toasted by sectionMutation.onError, just rethrow to stop the loop.
          throw new Error(`Failed at section ${project.getSection(sectionId)?.title || sectionId}. Process stopped.`);
        }
      }
      if (lastToastId) {
        Toaster.dismiss(lastToastId);
      }
    },
    onSuccess: () => {
      Toaster({
        title: "Project Build Complete",
        description: "All selected sections have been successfully generated.",
      });
    },
    onError: (error: Error) => {
      Toaster({
        title: "Project Build Failed",
        description: error.message,
        variant: "destructive",
      });
    },
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
      Toaster({ title: t('builder.Section.noTextError'), variant: 'destructive' });
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
    sectionMutation,
    chapterMutation,
    projectMutation,
    getContextNames,
  };
}
