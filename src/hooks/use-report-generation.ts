

// For a detailed explanation of the data flow, see docs/data-flows/report-section-generation.md
'use client';

import { SectionName } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { Project } from '@/lib/models/project';
import { generateReportSectionApi } from '@/services';
import { useMutation } from '@tanstack/react-query';
import { toast } from './use-toast';
import { useBuilderStore } from './useBuilderStore';

export function useGenerateReportSection() {
  const { firebaseUser, refetchUser } = useAuth();
  const { project, setProject } = useBuilderStore(); // Get project and setProject from the main store

  return useMutation({
    mutationFn: async (variables: { body: any }) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return generateReportSectionApi(variables.body, token);
    },
    onSuccess: (data, variables) => {
      if (!project) return;

      const sectionKey = variables.body.sectionToGenerate as SectionName;
      const content = Object.values(data)[0] as string;

      // Use the Project model's method to update the content
      project.updateSectionContent(sectionKey, content);

      // Set the updated project instance back into the store
      setProject(new Project(project.toStateObject()));

      refetchUser(); // To update credits
    },
    onError: (error: Error, variables) => {
      const item = variables.body.sectionToGenerate;
      toast({ title: `Failed to generate "${item}"`, description: error.message, variant: "destructive" });
    },
  });
}
