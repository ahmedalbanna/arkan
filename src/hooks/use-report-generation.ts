

// For a detailed explanation of the data flow, see docs/data-flows/report-section-generation.md
'use client';

import { SectionName } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { generateReportSectionApi } from '@/services';
import { useMutation } from '@tanstack/react-query';
import { toast } from './use-toast';
import { useBuilderStore } from './useBuilderStore';

export function useGenerateReportSection() {
  const { firebaseUser, refetchUser } = useAuth();
  const { updateProject } = useBuilderStore(); // Use the central updater function

  return useMutation({
    mutationFn: async (variables: { body: any }) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return generateReportSectionApi(variables.body, token);
    },
    onSuccess: (data, variables) => {

      const sectionKey = variables.body.sectionToGenerate as SectionName;
      const content = Object.values(data)[0] as string;

      // Use the safe updater to modify the project state
      updateProject(project => {
        // Defensive check: Only update if the project exists.
        if (project) {
          // Access the SectionManager and call its method
          project.sections.updateSection(sectionKey, content);
        }
      });

      refetchUser(); // To update credits
    },
    onError: (error: Error, variables) => {
      const item = variables.body.sectionToGenerate;
      toast({ title: `Failed to generate "${item}"`, description: error.message, variant: "destructive" });
    },
  });
}
