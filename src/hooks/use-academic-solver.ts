
'use client';

import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { analyzeApi, solveApi } from '@/services/academic-solver-service';
import type { AnalyzedDocument, SolvedDocument, AcademicDocumentType } from '@/ai/flows/academic-solver.shared';

interface AnalyzeVariables {
  markdown: string;
  documentType: AcademicDocumentType;
}

interface SolveVariables {
  analyzedDocument: AnalyzedDocument;
  contextMarkdown?: string;
}

/**
 * Hook to handle the mutation for analyzing an academic document.
 */
export function useAnalyzeAcademicDocument() {
  const { firebaseUser } = useAuth();
  return useMutation<AnalyzedDocument, Error, AnalyzeVariables>({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return analyzeApi({ ...variables, token });
    },
  });
}

/**
 * Hook to handle the mutation for solving an analyzed academic document.
 */
export function useSolveAcademicDocument() {
  const { firebaseUser } = useAuth();
  return useMutation<SolvedDocument, Error, SolveVariables>({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return solveApi({ ...variables, token });
    },
  });
}
