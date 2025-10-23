'use client';

import { SectionName } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { generateReportSectionApi } from '@/services';
import { useMutation } from '@tanstack/react-query';
import { toast } from './use-toast';
import { useBuilderStore } from './useBuilderStore';

/**
 * The expected output shape from the AI service when generating a report section.
 */
type ReportSectionGenerationOutput = {
    sectionName: SectionName;
    content: string;
};

// For a detailed explanation of the data flow, see docs/data-flows/report-section-generation.md
export function useGenerateReportSection() {
  const { firebaseUser, refetchUser } = useAuth();
  const { updateProject } = useBuilderStore(); // Use the central updater function

  return useMutation({
    mutationFn: async (variables: { body: any }): Promise<ReportSectionGenerationOutput> => {
      const token = await getAuthenticatedToken(firebaseUser);
      return generateReportSectionApi(variables.body, token);
    },
    onSuccess: (data: ReportSectionGenerationOutput, variables) => {

      const requestedSection = variables.body.sectionToGenerate as SectionName;

      // 1. Validate that the AI returned the section we asked for.
      if (data.sectionName !== requestedSection) {
        console.error(`AI Error: Requested section '${requestedSection}' but received '${data.sectionName}'.`);
        toast({
          title: "Generation Mismatch",
          description: "The AI returned a different section than what was requested. Please try again.",
          variant: "destructive",
        });
        return; // Halt execution
      }
      
      const { sectionName, content } = data;

      // 2. Use the safe updater to modify the project state via the correct architectural path.
      updateProject(project => {
        // Defensive check: Only update if the project and report exist.
        if (project?.report) {
          // ✅ The correct path after our refactoring
          project.report.sectionsManager.updateSection(sectionName, content);
        }
      });

      // 3. Refetch user to update credits
      refetchUser();
    },
    onError: (error: Error, variables) => {
      const item = variables.body.sectionToGenerate;
      toast({ title: `Failed to generate "${item}"`, description: error.message, variant: "destructive" });
    },
  });
}
