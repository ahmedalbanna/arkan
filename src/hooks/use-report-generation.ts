
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateReport } from '@/services/report-service';
import { toast } from './use-toast';
import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { SectionName } from '@/ai/schemas';
import { useReportStore } from './useReportStore';
import { userKeys } from '@/lib/query-keys';

export function useReportGeneration() {
  const { firebaseUser, refetchUser } = useAuth();
  const { setSection, setAllSections } = useReportStore();
  
  return useMutation({
    mutationFn: async (variables: { body: any }) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return generateReport(variables.body, token);
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
