
'use client';

import { SectionName } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useBuilderStore, toast } from '@/hooks';
import { generateReportSectionApi } from '@/services/api/reportService';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useSectionGenerator() {
  const { project, updateProject } = useBuilderStore();
  const { userProfile, refetchUser, firebaseUser } = useAuth();

  const agentMutation = useMutation({
    mutationKey: ['generateReportSection'], 
    mutationFn: async (sectionId: string) => {
      if (!project || !userProfile || !firebaseUser) throw new Error("Project or user not found.");

      const section = project.getSection(sectionId);
      if (!section) throw new Error("Section not found.");

      const token = await firebaseUser.getIdToken();

      const controls = section.controls;
      const context = section.context;

      let instructionText = `Please use a ${controls.tone || 'professional'} tone and aim for a word count of approximately ${controls.wordCount || 250} words. The complexity should be ${controls.complexity > 66 ? 'technical' : controls.complexity > 33 ? 'balanced' : 'simple'}. The formality should be ${controls.formality > 66 ? 'formal' : controls.formality > 33 ? 'semi-formal' : 'informal'}.`;
      if (controls.language && controls.language !== 'default') {
        const langMap: Record<string, string> = { en: 'English', ar: 'Arabic', es: 'Spanish', fr: 'French', de: 'German' };
        instructionText += ` The output language must be ${langMap[controls.language] || 'English'}.`;
      }
      if (controls.outputStyle) {
        const styleMap: Record<string, string> = {

          heading: 'Include headings in the output.',
          paragraph: 'Include paragraphs in the output.',
          list: 'Include lists in the output.',
          table: 'Include tables in the output.',
          code: 'Include code blocks in the output.',
        }
        instructionText += ` The output should be ${Object.entries(controls.outputStyle)
          .filter(([key, value]) => value)
          .map(([key, _]) => styleMap[key as keyof typeof styleMap])

          }`
      }

      const otherSectionsContext: Record<string, string> = {};
      Object.keys(context.sections || {}).forEach(key => {
        if (context.sections[key]) {
          const content = project.getSectionContent(key);
          if (content) {
            otherSectionsContext[key] = content;
          }
        }
      });

      const externalContextFiles = (project.externalContext || []).filter(item => context.externalContext?.[item.id]);

      const body = {
        flow: 'generate-section',
        sectionToGenerate: section.id as SectionName,
        prompt: section.prompt,
        otherSections: otherSectionsContext,
        externalContext: externalContextFiles,
        guidelines: section.guidelines,
        instructionText,
      };

      const result = await generateReportSectionApi(body, token);

      const content = result?.[section.id] ?? Object.values(result || {})[0] as string | undefined;
      if (!content) {
        toast({ title: 'Generation failed', description: `No content returned for section ${section.id}.`, variant: 'destructive' });
        throw new Error('Empty generation result');
      }

      return { sectionId: section.id, content };
    },
    onSuccess: (data) => {
      updateProject(p => p.updateSectionContent(data.sectionId, data.content));
      refetchUser();
      toast({ title: 'Section Generated', description: 'The AI has generated the content for your section.' });
    },
    onError: (error: any) => {
      toast({ title: 'Generation error', description: error?.message || 'Failed to generate section', variant: 'destructive' });
    },
  });

  return {
    onGenerate: (sectionId: string) => agentMutation.mutate(sectionId),
    isGenerating: agentMutation.isPending && agentMutation.variables === agentMutation.variables,
    isAnythingGenerating: agentMutation.isPending,
    hasCredits: !!userProfile && userProfile.credits !== undefined && userProfile.credits >= 1,
  };
}
