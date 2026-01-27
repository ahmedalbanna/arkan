
// @ts-nocheck
'use client';
import { getFirebaseAuthToken } from '@/lib/utils/authUtils';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useToast } from '@/hooks/util/use-toast';
import { Chapter, type Project } from '@/lib/models';
import { parseMarkdownToContent } from '@/lib/project/markdown-parser';
import { PromptBuilder } from '@/lib/prompt-builder';
import { projectKeys } from '@/lib/query-keys';
// Removed: old reportService - now using unifiedGenerationService
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Editor } from '@tiptap/react';
import { marked } from 'marked';
import { useCallback, useMemo } from 'react';
import { useEditorStore } from '../core/use-editor-store';
import { useBuilderStore } from '../core/useBuilderStore';

interface AiActionsProps {
  /** Optional TipTap editor instance. If not provided, uses the active editor from store. */
  editor?: Editor | null;
}

/**
 * AI Actions Hook
 *
 * Provides AI-powered content generation and manipulation features for the report builder.
 * Handles section generation, chapter generation, and text manipulation (translate, rewrite, etc.).
 *
 * @param props - Configuration options
 * @returns AI action handlers and state
 *
 * @example
 * ```tsx
 * const { generateSectionMutation, handleAiAction, isProcessing } = useAiActions();
 *
 * // Generate a section
 * generateSectionMutation.mutate('section-id');
 *
 * // Apply AI text manipulation
 * handleAiAction('summarize');
 * ```
 */
export function useAiActions({ editor: initialEditor }: AiActionsProps = {}) {
  const { t } = useLocalization();
  const { toast } = useToast();
  const { firebaseUser, refetchUser } = useAuth();
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

  const handleError = (error: Error) => {
    toast({
      title: t('builder.Section.aiActionFailed'),
      description: error.message,
      variant: 'destructive'
    });
  };

  const aiActionMutation = useMutation({
    mutationFn: async (variables: { textToManipulate: string; command: string; }) => {
      // Hardcoded response for testing
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      return { manipulatedText: `[Sample AI Response for: "${variables.command}"]\n\nThis is a hardcoded result for testing purposes. The original text was:\n"${variables.textToManipulate}"` };
    },
    onSuccess: (data: { manipulatedText: string }) => handleSuccess(data.manipulatedText),
    onError: handleError,
  });

  const translateMutation = useMutation({
    mutationFn: async (variables: { text: string; targetLang: string; }) => {
      // Hardcoded response for testing
      await new Promise(resolve => setTimeout(resolve, 500));
      return { text: `[Translated to ${variables.targetLang}] This is a hardcoded translation for testing.` };
    },
    onSuccess: (data: { text: string }) => handleSuccess(data.text),
    onError: handleError,
  });


  const isProcessing = aiActionMutation.isPending || translateMutation.isPending;

  const detectLanguage = (text: string): 'Arabic' | 'English' => {
    return /[؀-ۿ]/.test(text) ? 'Arabic' : 'English';
  };

  const handleAiAction = (action: string, payload: Record<string, unknown> = {}) => {
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
      rewrite: `Rewrite this text in a ${payload.style || 'default'} style: "${textToProcess}"`
    };

    const command = commandMap[action];

    if (command) {
      aiActionMutation.mutate({ textToManipulate: textToProcess, command });
    }
  };

  const generateSectionMutation = useMutation({
    mutationKey: ['generateReportSection'],
    mutationFn: async (sectionId: string) => {
      const currentProject = useBuilderStore.getState().project;
      if (!currentProject || !firebaseUser) throw new Error("Project or user not found.");

      const section = currentProject.getSection(sectionId);
      if (!section) throw new Error("Section not found.");

      // Mark section as generating before API call
      updateProject(p => p.updateSection(sectionId, s => s.markAsGenerating()));

      const token = await getFirebaseAuthToken();

      // Build complete prompts using PromptBuilder
      const systemPrompt = PromptBuilder.buildSectionSystemPrompt(section, currentProject);
      const userPrompt = PromptBuilder.buildSectionUserPrompt(section, currentProject);

      // Use unified generation service
      const { generateSection } = await import('@/services/api/unifiedGenerationService');
      return generateSection(section.id, systemPrompt, userPrompt, token);
    },
    onSuccess: (result, sectionId) => {
      // Extract content and metadata from unified response
      const content = result.content;
      const aiModel = result.metadata.modelUsed;

      // Update section with generated content and mark as generated
      updateProject(p => p.updateSection(sectionId, s => s.markAsGenerated(aiModel, content)));

      queryClient.invalidateQueries({ queryKey: projectKeys.detail(project?.id || '') });
      refetchUser();

      toast({
        title: 'Section Generated',
        description: `Successfully generated in ${result.metadata.processingTimeMs}ms.`
      });
    },
    onError: (error, sectionId) => {
      // Mark section as failed
      updateProject(p => p.updateSection(sectionId, s => s.markAsFailed()));

      toast({
        title: 'Section Generation Error',
        description: error.message || 'Failed to generate section',
        variant: 'destructive'
      });
    },
  });

  const generateChapterMutation = useMutation({
    mutationKey: ['generateChapterContent'],
    mutationFn: async (variables: { chapterId: string, sectionIds: string[] }) => {
      const { chapterId, sectionIds } = variables;
      const project = useBuilderStore.getState().project;
      if (!project || !firebaseUser) throw new Error("User or project not found.");

      const chapter = project.getChapter(chapterId);
      if (!chapter) throw new Error("Chapter not found.");

      const sectionsToBuild = chapter.sections.filter(s => sectionIds.includes(s.id));
      if (sectionsToBuild.length === 0) throw new Error('No sections selected in this chapter.');

      const token = await getFirebaseAuthToken();
      const body = {
        chapterTitle: chapter.title,
        sectionInstructions: sectionsToBuild.map(s => ({
          title: s.title,
          prompt: s.buildActionPrompt(),
          guidelines: s.guidelines,
          instructionText: PromptBuilder.buildSectionPrompt(s, project),
          context: '' // Context is handled at a higher level if needed, but here we scope it per section
        }))
      };

      // TODO: Implement chapter generation API endpoint
      // const result = await writingToolApi<any, { markdownContent: string }>(`/api/writing-tools/generate-chapter`, { data: body, token });
      // return { chapterId, content: result.markdownContent };

      // For now, generate sections sequentially
      let generatedContent = '';
      // const chapter = project.findChapter(chapterId);
      if (!chapter) throw new Error('Chapter not found');

      for (const section of chapter.sections) {
        // Use unified generation service
        const { generateSection } = await import('@/services/api/unifiedGenerationService');
        const systemPrompt = PromptBuilder.buildSectionSystemPrompt(section, currentProject);
        const userPrompt = PromptBuilder.buildSectionUserPrompt(section, currentProject);
        const result = await generateSection(section.id, systemPrompt, userPrompt, token);

        if (!result || !result.content) {
          throw new Error(`Failed to generate section: ${section.title}`);
        }

        generatedContent += result.content || '';
      }

      return { chapterId, content: generatedContent };
    },
    onSuccess: (data) => {
      updateProject(p => {
        // Re-parse the generated content for the whole chapter and update the sections within it
        const parsedContent = parseMarkdownToContent(data.content, p.content);
        const newChapter = parsedContent[0]; // Assuming one chapter was generated
        if (newChapter instanceof Chapter) {
          // This replaces the old sections with newly generated ones
          return p.updateChapter(data.chapterId, c => c.with({ sections: [...newChapter.sections] }));
        }
        return p;
      });
      refetchUser();
      toast({ title: 'Chapter Generated', description: 'The AI has generated the content for the chapter.' });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({ title: 'Chapter Generation Error', description: errorMessage, variant: 'destructive' });
    }
  });

  const generateProjectMutation = useMutation({
    mutationKey: ['generateProjectContent'],
    mutationFn: async ({ project, selectedSectionIds }: { project: Project; selectedSectionIds: Set<string> }) => {
      if (!firebaseUser) throw new Error("User not found.");
      if (selectedSectionIds.size === 0) throw new Error('No sections were selected for generation.');

      // Generate sections in parallel for better performance
      const sectionArray = Array.from(selectedSectionIds);
      const results = await Promise.allSettled(
        sectionArray.map(sectionId => generateSectionMutation.mutateAsync(sectionId))
      );

      // Check for failures
      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        const failureCount = failures.length;
        const successCount = results.length - failureCount;
        throw new Error(
          `${failureCount} section(s) failed to generate. ${successCount} succeeded. Check individual sections for details.`
        );
      }

      return results;
    },
    onSuccess: () => toast({
      title: "Project Build Complete",
      description: "All selected sections have been successfully generated."
    }),
    onError: (error: Error) => toast({
      title: "Project Build Failed",
      description: error.message,
      variant: "destructive"
    }),
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
    generateChapterMutation,
    generateProjectMutation,
  };
}
