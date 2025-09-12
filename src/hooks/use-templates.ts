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

export function useCreateProposalTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation<ProposalTemplateType, Error, Omit<ProposalTemplateType, 'id' | 'createdAt'> & { id: string }>({
        mutationFn: async (data) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return createProposalTemplate(data, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: templateKeys.proposals() });
        },
        onError: (error: any) => {
            throw error;
        }
    });
}

export function useCreateReportTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation<ReportTemplateType, Error, Omit<ReportTemplateType, 'isDefault' | 'createdAt'> & { id: string }>({
        mutationFn: async (data) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return createReportTemplate(data, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: templateKeys.reports() });
        },
        onError: (error: any) => {
            throw error;
        }
    });
}

export function useCreatePresentationTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation<PresentationTemplateType, Error, Omit<PresentationTemplateType, 'isDefault' | 'createdAt'> & { id: string }>({
        mutationFn: async (data) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return createPresentationTemplate(data, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: templateKeys.presentations() });
        },
        onError: (error: any) => {
            throw error;
        }
    });
}


export function useUpdateProposalTemplate() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  return useMutation({
    mutationFn: async (variables: UpdateTemplateVariables<ProposalTemplateType>) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return updateProposalTemplate(variables.templateId, variables.data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.proposals() });
      toast({ title: 'Success', description: 'Proposal template updated.' });
    },
    onError: (error: Error) => handleErrorUtility(error, "Failed to update template"),
  });
}

export function useUpdateReportTemplate() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  return useMutation({
    mutationFn: async (variables: UpdateTemplateVariables<ReportTemplateType>) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return updateReportTemplate(variables.templateId, variables.data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.reports() });
      toast({ title: 'Success', description: 'Report template updated.' });
    },
    onError: (error: Error) => handleErrorUtility(error, "Failed to update template"),
  });
}

export function useUpdatePresentationTemplate() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  return useMutation({
    mutationFn: async (variables: UpdateTemplateVariables<PresentationTemplateType>) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return updatePresentationTemplate(variables.templateId, variables.data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.presentations() });
      toast({ title: 'Success', description: 'Presentation template updated.' });
    },
    onError: (error: Error) => handleErrorUtility(error, "Failed to update template"),
  });
}


export function useDeleteProposalTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (templateId: string) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deleteProposalTemplate(templateId, token);
        },
        onSuccess: (data, templateId) => {
            queryClient.invalidateQueries({ queryKey: templateKeys.proposals() });
            toast({ title: "Template Deleted", description: `Template "${templateId}" has been deleted.` });
        },
        onError: (error: Error) => handleErrorUtility(error, "Failed to delete template"),
    });
}

export function useDeleteReportTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (templateId: string) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deleteReportTemplate(templateId, token);
        },
        onSuccess: (data, templateId) => {
            queryClient.invalidateQueries({ queryKey: templateKeys.reports() });
            toast({ title: "Template Deleted", description: `Template "${templateId}" has been deleted.` });
        },
        onError: (error: Error) => handleErrorUtility(error, "Failed to delete template"),
    });
}

export function useDeletePresentationTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (templateId: string) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deletePresentationTemplate(templateId, token);
        },
        onSuccess: (data, templateId) => {
            queryClient.invalidateQueries({ queryKey: templateKeys.presentations() });
            toast({ title: "Template Deleted", description: `Template "${templateId}" has been deleted.` });
        },
        onError: (error: Error) => handleErrorUtility(error, "Failed to delete template"),
    });
}



export function useRefreshTemplateImage(templateType: 'docx' | 'pptx') {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation({
        mutationFn: async (variables: { templateId: string, prompt: string}) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return refreshTemplateImage({ ...variables, templateType }, token);
        },
        onSuccess: () => {
            toast({ title: "Image Refreshing", description: "The new preview image is being generated."});
            if(templateType === 'docx') {
                queryClient.invalidateQueries({ queryKey: docxTemplateKeys.lists() });
            } else {
                queryClient.invalidateQueries({ queryKey: pptxTemplateKeys.lists() });
            }
        },
        onError: (error: Error) => {
            handleErrorUtility(error, "Failed to refresh image");
        }
    })
}
