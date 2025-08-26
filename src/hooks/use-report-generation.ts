
// For a detailed explanation of the data flow, see docs/data-flows/report-section-generation.md
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateReportSectionApi, generateFullReportApi } from '@/services/report-service';
import { toast } from './use-toast';
import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { SectionName } from '@/ai/schemas';
import { useReportStore } from './useReportStore';
import { userKeys } from '@/lib/query-keys';

export function useGenerateReportSection() {
  const { firebaseUser, refetchUser } = useAuth();
  const { setSection } = useReportStore();

  return useMutation({
    mutationFn: async (variables: { body: any }) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return generateReportSectionApi(variables.body, token);
    },
    onSuccess: (data, variables) => {
      const sectionKey = variables.body.sectionToGenerate as SectionName;
      const content = Object.values(data)[0] as string;
      setSection(sectionKey, content);

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
    const { setAllSections } = useReportStore();
    return useMutation({
        mutationFn: async (body: any) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return generateFullReportApi(body, token);
        },
        onSuccess: (data) => {
             setAllSections(data);
             refetchUser();
             toast({ title: "Full Report Generated", description: "All selected sections have been created." });
        },
        onError: (error: Error) => {
             toast({ title: "Full Report Generation Failed", description: error.message, variant: "destructive" });
        }
    });
}
