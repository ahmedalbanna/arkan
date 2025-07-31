
'use client';

import { useMutation } from '@tanstack/react-query';
import { generateReport } from '@/services/report-service';
import { toast } from './use-toast';
import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { SectionName } from '@/ai/schemas';
import { useReportStore } from './useReportStore';

export function useReportGeneration() {
  const { firebaseUser } = useAuth();
  const { setSection, setAllSections } = useReportStore();

  const handleSuccess = (data: any, variables: any) => {
    if (variables.body.templateId) { // Full report
      setAllSections(data.sections);
      toast({ title: "Full report generated successfully!" });
    } else { // Single section
      const sectionKey = variables.body.sectionToGenerate as SectionName;
      const content = Object.values(data)[0] as string;
      setSection(sectionKey, content);
    }
  };

  const handleError = (error: Error, variables: any) => {
    const item = variables.body.templateId || variables.body.sectionToGenerate;
    toast({ title: `Failed to generate "${item}"`, description: error.message, variant: "destructive" });
  };

  return useMutation({
    mutationFn: async (body: any) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return generateReport(body, token);
    },
    onSuccess: handleSuccess,
    onError: handleError,
  });
}
