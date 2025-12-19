
'use client';

import { GenerationControlState, SectionType } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useBuilderStore, toast } from '@/hooks';
import { generateReportSectionApi } from '@/services/api/reportService';
import { useMutation } from '@tanstack/react-query';

/**
 * Builds a detailed instruction string for the AI based on the section's controls.
 * @param controls The generation controls for the section.
 * @param sectionType The type of the section ('document' or 'presentation').
 * @returns A string containing the formatted instructions.
 */
export function buildInstructionText(controls: GenerationControlState, sectionType: SectionType): string {
    let instructions: string[] = [];

    if (sectionType === 'document') {
        const formalityMap: { [key: number]: string } = { 0: 'very informal and casual', 33: 'balanced and neutral', 67: 'formal and professional', 100: 'very formal and academic' };
        const complexityMap: { [key: number]: string } = { 0: 'very simple and easy to understand', 33: 'clear and straightforward', 67: 'detailed and technical', 100: 'highly complex and expert-level' };

        const formality = controls.formality > 67 ? formalityMap[100] : controls.formality > 33 ? formalityMap[67] : controls.formality > 0 ? formalityMap[33] : formalityMap[0];
        instructions.push(`The formality should be ${formality}.`);

        const complexity = controls.complexity > 67 ? complexityMap[100] : controls.complexity > 33 ? complexityMap[67] : controls.complexity > 0 ? complexityMap[33] : complexityMap[0];
        instructions.push(`The complexity should be ${complexity}.`);
        
        if (controls.tone) instructions.push(`The tone should be ${controls.tone}.`);
        if (controls.wordCount) instructions.push(`Aim for a word count of approximately ${controls.wordCount} words.`);

        if (controls.outputStyle.diagram && controls.outputDiagramType) {
            instructions.push(`The output must include a PlantUML diagram of type '${controls.outputDiagramType}'.`);
        }
        if (controls.outputStyle.code && controls.programmingLanguage) {
            instructions.push(`The code blocks should be in ${controls.programmingLanguage}.`);
        }

    } else if (sectionType === 'presentation') {
        if (controls.presentationType) instructions.push(`This is for a ${controls.presentationType} presentation.`);
        if (controls.presentationTone) instructions.push(`The tone for this presentation slide should be ${controls.presentationTone}.`);
    }

    if (controls.language && controls.language !== 'default') {
        const langMap: Record<string, string> = { en: 'English', ar: 'Arabic', es: 'Spanish', fr: 'French', de: 'German' };
        instructions.push(`The output language must be ${langMap[controls.language] || 'English'}.`);
    }

    const enabledStyles = Object.entries(controls.outputStyle).filter(([, value]) => value).map(([key]) => key);
    if (enabledStyles.length > 0) instructions.push(`The output should primarily include the following elements: ${enabledStyles.join(', ')}.`);

    
    return instructions.join(' ');
}


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

      const instructionText = buildInstructionText(controls, section.type);

      const otherSectionsContext: Record<string, string> = {};
      Object.keys(context.sections || {}).forEach(key => {
        if (context.sections[key]) {
          const content = project.getSectionContent(key);
          if (content) {
            otherSectionsContext[key] = content;
          }
        }
      });
      
      let externalContextFiles = (project.externalContext || []).filter(item => context.externalContext?.[item.id]);

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
