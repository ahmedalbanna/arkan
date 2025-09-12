

// For a detailed explanation of the data flow, see docs/data-flows/report-section-generation.md
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateReportSectionApi, generateFullReportApi } from '@/services';
import { toast } from './use-toast';
import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { SectionName } from '@/ai/schemas';
import { useBuilderStore } from './useBuilderStore';
import { userKeys } from '@/lib/query-keys';
import { Project } from '@/lib/models/project';

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

export function useGenerateFullReport() {
    const { firebaseUser, refetchUser } = useAuth();
    const { project, setProject } = useBuilderStore();
    
    return useMutation({
        mutationFn: async (body: any) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return generateFullReportApi(body, token);
        },
        onSuccess: (data) => {
            if (!project) return;

            // Update all sections returned from the API
            Object.keys(data).forEach(key => {
                project.updateSectionContent(key as SectionName, data[key]);
            });

            setProject(new Project(project.toStateObject()));
             
             refetchUser();
             toast({ title: "Full Report Generated", description: "All selected sections have been created." });
        },
        onError: (error: Error) => {
             toast({ title: "Full Report Generation Failed", description: error.message, variant: "destructive" });
        }
    });
}
