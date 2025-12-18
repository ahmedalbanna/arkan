
'use client';

import { GenerationControlState, SectionName } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useBuilderStore, toast } from '@/hooks';
import { generateReportSectionApi } from '@/services/api/reportService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Chapter } from '@/lib/models';

/**
 * Builds a detailed instruction string for the AI based on the section's controls.
 * @param controls The generation controls for the section.
 * @returns A string containing the formatted instructions.
 */
function buildInstructionText(controls: GenerationControlState, allChapters: Chapter[] = []): string {
    let instructions: string[] = [];

    // General instructions from the textarea
    if (controls.instructionText) {
        instructions.push(controls.instructionText);
    }
    
    // Handle different section types
    switch (controls.type) {
        case 'generation':
            const formalityMap: { [key: number]: string } = { 0: 'very informal and casual', 33: 'balanced and neutral', 67: 'formal and professional', 100: 'very formal and academic' };
            const complexityMap: { [key: number]: string } = { 0: 'very simple and easy to understand', 33: 'clear and straightforward', 67: 'detailed and technical', 100: 'highly complex and expert-level' };

            const formality = controls.formality > 67 ? formalityMap[100] : controls.formality > 33 ? formalityMap[67] : controls.formality > 0 ? formalityMap[33] : formalityMap[0];
            instructions.push(`The formality should be ${formality}.`);

            const complexity = controls.complexity > 67 ? complexityMap[100] : controls.complexity > 33 ? complexityMap[67] : controls.complexity > 0 ? complexityMap[33] : complexityMap[0];
            instructions.push(`The complexity should be ${complexity}.`);

            if (controls.tone) instructions.push(`The tone should be ${controls.tone}.`);
            if (controls.language && controls.language !== 'default') {
                const langMap: Record<string, string> = { en: 'English', ar: 'Arabic', es: 'Spanish', fr: 'French', de: 'German' };
                instructions.push(`The output language must be ${langMap[controls.language] || 'English'}.`);
            }
            if (controls.wordCount) instructions.push(`Aim for a word count of approximately ${controls.wordCount} words.`);

            const enabledStyles = Object.entries(controls.outputStyle).filter(([, value]) => value).map(([key]) => key);
            if (enabledStyles.length > 0) instructions.push(`The output should include the following elements: ${enabledStyles.join(', ')}.`);
            break;

        case 'text-manipulation':
            switch (controls.manipulationType) {
                case 'rewrite':
                    instructions.push(`Rewrite the provided context text in a ${controls.rewriteStyle || 'neutral'} style.`);
                    break;
                case 'summarize':
                    instructions.push(`Summarize the provided context text to about ${controls.compressionRatio || 50}% of its original length.`);
                    break;
                case 'style-editor':
                    let styleEditorCmd = 'Improve the writing style of the context text.';
                    if (controls.targetAudience) styleEditorCmd += ` The target audience is ${controls.targetAudience}.`;
                    if (controls.tone) styleEditorCmd += ` The desired tone is ${controls.tone}.`;
                    instructions.push(styleEditorCmd);
                    break;
                case 'readability-enhancer':
                    instructions.push(`Enhance the readability of the context text. Target a ${controls.targetLevel || 'high-school'} reading level.`);
                    break;
                case 'conciseness-checker':
                    instructions.push(`Make the context text more concise, aiming for a ${controls.targetReduction || 20}% reduction in word count.`);
                    break;
                case 'clarity-advisor':
                    let clarityCmd = 'Improve the clarity of the context text.';
                    if (controls.focusAreas && controls.focusAreas.length > 0) {
                        clarityCmd += ` Focus on these areas: ${controls.focusAreas.join(', ')}.`;
                    }
                    instructions.push(clarityCmd);
                    break;
            }
            break;

        case 'analysis':
            switch (controls.analysisType) {
                case 'question-answering':
                    instructions.push(`Answer the following question based on the provided context: "${controls.question || ''}"`);
                    break;
                case 'fact-retrieval':
                    instructions.push(`Retrieve the specific fact for the query: "${controls.factQuery || ''}"`);
                    break;
                case 'custom-analysis':
                default:
                    // The main prompt is used for custom analysis
                    break;
            }
            break;
        
        case 'document-processing':
            switch (controls.processingAction) {
                case 'extract-text':
                    instructions.push("Extract and clean all text from the source document, formatting it as clean markdown.");
                    break;
                case 'summarize':
                    instructions.push("Provide a concise summary of the source document.");
                    break;
                case 'translate':
                     const langMap: Record<string, string> = { en: 'English', ar: 'Arabic', es: 'Spanish', fr: 'French', de: 'German' };
                    instructions.push(`Translate the source document into ${langMap[controls.language || 'en'] || 'English'}.`);
                    break;
            }
            break;
        
        case 'utilities':
            switch(controls.utilityAction) {
                case 'generate-toc':
                    const sectionTitles = allChapters.flatMap(c => c.sections.map(s => s.title));
                    instructions.push(`Generate a formatted table of contents based on the following section titles: ${sectionTitles.join(', ')}. The output should be a markdown list.`);
                    break;
            }
            break;
    }
    
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

      const instructionText = buildInstructionText(controls, project.chapters);

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

      // For document processing, the source file is the primary context
      if (section.type === 'document-processing' && controls.sourceFileId) {
          const sourceFile = project.externalContext.find(f => f.id === controls.sourceFileId);
          if (sourceFile) {
              externalContextFiles = [sourceFile];
          }
      }

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
    buildInstructionText, // Export for use in UI
  };
}
