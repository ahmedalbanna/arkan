'use client';

import { useCallback, useMemo } from 'react';
import { Editor } from '@tiptap/react';
import { useToast } from '@/hooks/util/use-toast';
import { useLocalization } from '@/context/LocalizationContext';
import { marked } from 'marked';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useBuilderStore } from '@/modules/projects/adapters/state/useBuilderStore';
import { ReportApiClient } from '@/modules/ai-content/adapters/api-client/ReportApiClient';
import { container } from '@/infrastructure/di/container';
import type { SectionName } from '@/modules/ai/domain/schemas';
import { PromptBuilder } from '@/modules/ai-content/domain/services/PromptBuilder';
import { WritingToolsApiClient } from '@/modules/ai/adapters/api-client/WritingToolsApiClient';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { type Project } from '@/modules/projects/domain/entities/Project';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { type ExternalContextType } from '@/modules/ai-content/domain/entities/ControlTypes';
import { parseMarkdownToContent } from '@/modules/projects/infrastructure/io/markdown-parser';
import { useEditorStore } from '@/modules/ai-content/adapters/state/use-editor-store';
import { useGenerationUIStore } from '@/modules/ai-content/adapters/state/useGenerationUIStore';
import { projectKeys } from '@/infrastructure/api/query-keys';
import { runAuthenticatedResultCall } from '@/infrastructure/api/authenticated-client-call';

interface AiActionsProps {
  editor?: Editor | null;
}

export function useAiActions({ editor: initialEditor }: AiActionsProps = {}) {
  const { t } = useLocalization();
  const { toast } = useToast();
  const { user, refetchUser } = useAuth();
  const { project, updateProject } = useBuilderStore();
  const { activeEditor } = useEditorStore();
  const queryClient = useQueryClient();

  const editor = initialEditor || activeEditor;

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

  const handleError = (error: any, title?: string) => {
    // Attempt to extract structured error from n8n if available
    let description = error.message || "An unexpected error occurred.";
    if (error.response?.data?.error) {
      description = error.response.data.error;
    } else if (error.error?.message) {
      description = error.error.message;
    }

    toast({
      title: title || t('builder.Section.aiActionFailed'),
      description,
      variant: 'destructive',
    });
  };

  const aiActionMutation = useMutation({
    mutationFn: async (variables: { textToManipulate: string; command: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        manipulatedText: `[Sample AI Response for: "${variables.command}"]\n\nThis is a hardcoded result for testing purposes. The original text was:\n"${variables.textToManipulate}"`,
      };
    },
    onSuccess: (data: any) => handleSuccess(data.manipulatedText),
    onError: (error: any) => handleError(error),
  });

  const translateMutation = useMutation({
    mutationFn: async (variables: { text: string; targetLang: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { text: `[Translated to ${variables.targetLang}] This is a hardcoded translation for testing.` };
    },
    onSuccess: (data: any) => handleSuccess(data.text),
    onError: (error: any) => handleError(error),
  });

  const isProcessing = aiActionMutation.isPending || translateMutation.isPending;

  const detectLanguage = (text: string): 'Arabic' | 'English' => (/[؀-ۿ]/.test(text) ? 'Arabic' : 'English');

  const handleAiAction = (action: string, payload: any = {}) => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    const textToProcess = selectedText.trim() || editor.getText();

    if (!textToProcess) {
      toast({ title: t('builder.Section.noTextError'), variant: 'destructive' });
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
      rewrite: `Rewrite this text in a ${payload.style || 'default'} style: "${textToProcess}"`,
    };

    const command = commandMap[action];

    if (command) {
      aiActionMutation.mutate({ textToManipulate: textToProcess, command });
    }
  };

  const mapSectionContextToRecord = (currentSection: Section, currentProject: Project) => {
    const context = currentSection.context?.sections || {};
    return Object.entries(context).reduce<Record<string, string>>((acc, [sectionId]) => {
      const target = currentProject.getSection(sectionId);
      if (target?.content) {
        acc[target.title] = target.content;
      }
      return acc;
    }, {});
  };

  const mapExternalContextToArray = (currentSection: Section, currentProject: Project) => {
    const context = currentSection.context?.externalContext || {};
    return Object.entries(context)
      .map(([externalId, usage]) => {
        const external = currentProject.externalContext.find((item) => item.id === externalId);
        return external ? { id: external.id, content: external.content, type: usage } : null;
      })
      .filter((item): item is { id: string; content: string; type: ExternalContextType } => Boolean(item));
  };

  const generateSectionMutation = useMutation({
    mutationKey: ['generateReportSection'],
    mutationFn: async (sectionId: string) => {
      // Sync structure from markdown before generation to ensure correct context
      useBuilderStore.getState().syncProjectStructure();
      
      const currentProject = useBuilderStore.getState().project;
      if (!currentProject || !user) throw new Error('Project or user not found.');

      const section = currentProject.getSection(sectionId);
      if (!section) throw new Error('Section not found.');

      const controller = new AbortController();
      useGenerationUIStore.getState().registerAbortController(sectionId, controller);

      const body = {
        projectId: currentProject.id,
        sectionToGenerate: section.id as SectionName,
        prompt: section.buildActionPrompt(),
        otherSections: mapSectionContextToRecord(section, currentProject),
        externalContext: mapExternalContextToArray(section, currentProject),
        guidelines: section.guidelines,
        instructionText: container.resolve(PromptBuilder).buildSectionPrompt(section, currentProject),
      };

      try {
        const client = container.resolve(ReportApiClient);
        const result = await client.generateReportSectionApi(body, controller.signal);
        if (result.isFailure) throw result.error;
        return result.getValue();
      } finally {
        useGenerationUIStore.getState().removeAbortController(sectionId);
      }
    },
    onSuccess: (data, sectionId) => {
      updateProject((currentProject) => currentProject.updateSection(sectionId, (section) => section.withProps({ content: data.content })));
      if (project?.id && user?.uid) {
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(user.uid, project.id) });
      }
      refetchUser();
      toast({ title: 'Generation In Progress', description: 'The AI is generating your content. It will appear automatically when ready.' });
    },
    onError: (error: any) => {
      if (error.name === 'AbortError') return;
      handleError(error, 'Section Generation Error');
    },
  });

  const generateSectionWithRAGMutation = useMutation({
    mutationKey: ['generateSectionWithRAG'],
    mutationFn: async (sectionId: string) => {
      useBuilderStore.getState().syncProjectStructure();
      const currentProject = useBuilderStore.getState().project;
      if (!currentProject || !user) throw new Error('Project or user not found.');

      const section = currentProject.getSection(sectionId);
      if (!section) throw new Error('Section not found.');

      const body = {
        projectId: currentProject.id,
        sectionId: section.id,
        prompt: section.buildActionPrompt(),
        guidelines: section.guidelines,
      };

      const result = await runAuthenticatedResultCall(user, WritingToolsApiClient, (client, token) =>
        client.writingToolApi<any, { content: string }>('/api/generate/section-rag', { data: body, token }),
      );

      return result;
    },
    onSuccess: (data, sectionId) => {
      updateProject((currentProject) => currentProject.updateSection(sectionId, (section) => section.withProps({ content: data.content })));
      refetchUser();
      toast({ title: 'RAG Generation Successful', description: 'Content generated with project sources.' });
    },
    onError: (error: any) => handleError(error, 'RAG Section Generation Error'),
  });

  const generateChapterMutation = useMutation({
    mutationKey: ['generateChapterContent'],
    mutationFn: async (variables: { chapterId: string; sectionIds: string[] }) => {
      // Sync structure from markdown before generation to ensure correct context
      useBuilderStore.getState().syncProjectStructure();

      const { chapterId, sectionIds } = variables;
      const currentProject = useBuilderStore.getState().project;
      if (!currentProject || !user) throw new Error('User or project not found.');

      const chapter = currentProject.getChapter(chapterId);
      if (!chapter) throw new Error('Chapter not found.');

      const sectionsToBuild = chapter.sections.filter((section) => sectionIds.includes(section.id));
      if (sectionsToBuild.length === 0) throw new Error('No sections selected in this chapter.');

      const body = {
        chapterTitle: chapter.title,
        sectionInstructions: sectionsToBuild.map((section) => ({
          title: section.title,
          prompt: section.buildActionPrompt(),
          guidelines: section.guidelines,
          instructionText: container.resolve(PromptBuilder).buildSectionPrompt(section, currentProject),
          context: '',
        })),
      };

      const result = await runAuthenticatedResultCall(user, WritingToolsApiClient, (client, token) =>
        client.writingToolApi<any, { markdownContent: string }>('/api/writing-tools/generate-chapter', { data: body, token }),
      );

      return { chapterId, content: result.markdownContent };
    },
    onSuccess: (data) => {
      updateProject((currentProject) => {
        const parsedContent = parseMarkdownToContent(data.content, currentProject.content);
        const newChapter = parsedContent[0];
        if (newChapter instanceof Chapter) {
          return currentProject.updateChapter(data.chapterId, (chapter) => chapter.withProps({ sections: newChapter.sections.map(s => s.toProperties()) }));
        }
        return currentProject;
      });
      refetchUser();
      toast({ title: 'Chapter Generated', description: 'The AI has generated the content for the chapter.' });
    },
    onError: (error: any) => handleError(error, 'Chapter Generation Error'),
  });

  const generateChapterWithRAGMutation = useMutation({
    mutationKey: ['generateChapterWithRAG'],
    mutationFn: async (variables: { chapterId: string; sectionIds: string[] }) => {
      useBuilderStore.getState().syncProjectStructure();
      const { chapterId, sectionIds } = variables;
      const currentProject = useBuilderStore.getState().project;
      if (!currentProject || !user) throw new Error('User or project not found.');

      const chapter = currentProject.getChapter(chapterId);
      if (!chapter) throw new Error('Chapter not found.');

      const body = {
        projectId: currentProject.id,
        chapterId: chapter.id,
        sectionIds,
      };

      const result = await runAuthenticatedResultCall(user, WritingToolsApiClient, (client, token) =>
        client.writingToolApi<any, { content: string }>('/api/generate/chapter-rag', { data: body, token }),
      );

      return { chapterId, content: result.content };
    },
    onSuccess: (data) => {
      updateProject((currentProject) => {
        const parsedContent = parseMarkdownToContent(data.content, currentProject.content);
        const newChapter = parsedContent[0];
        if (newChapter instanceof Chapter) {
          return currentProject.updateChapter(data.chapterId, (chapter) => chapter.withProps({ sections: newChapter.sections.map(s => s.toProperties()) }));
        }
        return currentProject;
      });
      refetchUser();
      toast({ title: 'RAG Chapter Generated', description: 'Chapter generated with project sources.' });
    },
    onError: (error: any) => handleError(error, 'RAG Chapter Generation Error'),
  });

  const generateProjectMutation = useMutation({
    mutationKey: ['generateProjectContent'],
    mutationFn: async ({ project, selectedSectionIds, useRAG = false }: { project: Project; selectedSectionIds: Set<string>; useRAG?: boolean }) => {
      if (!user) throw new Error('User not found.');
      if (selectedSectionIds.size === 0) throw new Error('No sections were selected for generation.');

      const { startBulk, stopBulk, incrementProgress } = useGenerationUIStore.getState();
      startBulk(selectedSectionIds.size);

      try {
        for (const sectionId of selectedSectionIds) {
          if (useGenerationUIStore.getState().abortRequested) {
            useGenerationUIStore.getState().cancelGeneration(sectionId);
            toast({ title: 'Generation Stopped', description: 'Bulk generation was canceled by user.' });
            break;
          }
          
          if (useRAG) {
            await generateSectionWithRAGMutation.mutateAsync(sectionId);
          } else {
            await generateSectionMutation.mutateAsync(sectionId);
          }
          
          incrementProgress();
        }
      } finally {
        stopBulk();
      }
    },
    onSuccess: () => {
        if (!useGenerationUIStore.getState().abortRequested) {
            toast({ title: 'Project Build Complete', description: 'All selected sections have been successfully generated.' });
        }
    },
    onError: (error: Error) => toast({ title: 'Project Build Failed', description: error.message, variant: 'destructive' }),
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
    isProcessing,
    handleAiAction,
    rewriteStyles,
    generateSectionMutation,
    generateSectionWithRAGMutation,
    generateChapterMutation,
    generateChapterWithRAGMutation,
    generateProjectMutation,
  };
}
