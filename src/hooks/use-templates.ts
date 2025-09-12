'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProposalTemplates,
  fetchReportTemplates,
  fetchPresentationTemplates,
  updateProposalTemplate,
  updateReportTemplate,
  updatePresentationTemplate,
  createProposalTemplate,
  createReportTemplate,
  createPresentationTemplate,
  deleteProposalTemplate,
  deleteReportTemplate,
  deletePresentationTemplate,
  refreshTemplateImage,
  type ProposalTemplate as ProposalTemplateType,
  type ReportGenerationTemplate as ReportTemplateType,
  type PresentationGenerationTemplate as PresentationTemplateType,
} from "@/services";
import { useAuth } from "@/context/AuthContext";
import { toast } from "./use-toast";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";
import { docxTemplateKeys } from "./use-docx-styles";
import { pptxTemplateKeys } from "./use-pptx-styles";
import { templateKeys } from "@/lib/query-keys";
import { ProposalTemplate, type ProposalTemplateProperties } from "@/lib/models/proposalTemplate";
import { ReportTemplate, type ReportTemplateProperties } from "@/lib/models/reportTemplate";
import { PresentationTemplate, type PresentationTemplateProperties } from "@/lib/models/presentationTemplate";

export { templateKeys };

interface UpdateTemplateVariables<T> {
  templateId: string;
  data: Partial<T>;
}

export function useProposalTemplates() {
  const { firebaseUser } = useAuth();
  return useQuery({
    queryKey: templateKeys.proposals(),
    queryFn: async () => {
        const token = await getAuthenticatedToken(firebaseUser);
        return fetchProposalTemplates(token);
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 5,
    meta: {
      onError: (error: Error) => handleErrorUtility(error, "Failed to fetch proposal templates"),
    },
    select: (data: ProposalTemplateType[]) => data.map(t => new ProposalTemplate(t as ProposalTemplateProperties)),
  });
}

export function useReportTemplates() {
  const { firebaseUser } = useAuth();
  return useQuery({
    queryKey: templateKeys.reports(),
    queryFn: async () => {
        const token = await getAuthenticatedToken(firebaseUser);
        return fetchReportTemplates(token);
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 5,
    meta: {
      onError: (error: Error) => handleErrorUtility(error, "Failed to fetch report templates"),
    },
    select: (data: ReportTemplateType[]) => data.map(t => new ReportTemplate(t as ReportTemplateProperties)),
  });
}

export function usePresentationTemplates() {
  const { firebaseUser } = useAuth();
  return useQuery({
    queryKey: templateKeys.presentations(),
    queryFn: async () => {
        const token = await getAuthenticatedToken(firebaseUser);
        return fetchPresentationTemplates(token);
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 5,
    meta: {
      onError: (error: Error) => handleErrorUtility(error, "Failed to fetch presentation templates"),
    },
    select: (data: PresentationTemplateType[]) => data.map(t => new PresentationTemplate(t as PresentationTemplateProperties)),
  });
}

// ... (Rest of the mutation hooks remain unchanged)