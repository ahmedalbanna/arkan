
'use client';

import { useAuth } from "@/context/AuthContext";
import { getAuthenticatedToken } from "@/lib/authUtils";
import { handleErrorUtility } from "@/lib/errorUtils";
import { PresentationTemplate, type PresentationTemplateProperties } from "@/lib/models/presentationTemplate";
import { ProposalTemplate, type ProposalTemplateProperties } from "@/lib/models/proposalTemplate";
import { ReportTemplate, type ReportTemplateProperties } from "@/lib/models/reportTemplate";
import { templateKeys } from "@/lib/query-keys";
import {
  createPresentationTemplate,
  createProposalTemplate,
  createReportTemplate,
  deletePresentationTemplate,
  deleteProposalTemplate,
  deleteReportTemplate,
  fetchPresentationTemplates,
  fetchProposalTemplates,
  fetchReportTemplates,
  refreshTemplateImage,
  updatePresentationTemplate,
  updateProposalTemplate,
  updateReportTemplate,
} from "@/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { docxTemplateKeys } from "./use-docx-styles";
import { pptxTemplateKeys } from "./use-pptx-styles";
import { toast } from "./use-toast";

export { templateKeys };

interface UpdateTemplateVariables<T> {
  templateId: string;
  data: Partial<T>;
}

export function useProposalTemplates() {
  const { firebaseUser } = useAuth();
  return useQuery<ProposalTemplate[], Error>({
    queryKey: templateKeys.proposals(),
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);
      const data = await fetchProposalTemplates(token);
      // Transform plain objects into class instances
      return data.map(t => new ProposalTemplate(t as ProposalTemplateProperties));
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 5,
    meta: {
      onError: (error: Error) => handleErrorUtility(error, "Failed to fetch proposal templates"),
    },
  });
}

export function useReportTemplates() {
  const { firebaseUser } = useAuth();
  return useQuery<ReportTemplate[], Error>({
    queryKey: templateKeys.reports(),
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);
      const data = await fetchReportTemplates(token);
      return data.map(t => new ReportTemplate(t as ReportTemplateProperties));
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 5,
    meta: {
      onError: (error: Error) => handleErrorUtility(error, "Failed to fetch report templates"),
    },
  });
}

export function usePresentationTemplates() {
  const { firebaseUser } = useAuth();
  return useQuery({
    queryKey: templateKeys.presentations(),
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);
      const data = await fetchPresentationTemplates(token);
      return data.map(t => new PresentationTemplate(t as PresentationTemplateProperties));
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 5,
    meta: {
      onError: (error: Error) => handleErrorUtility(error, "Failed to fetch presentation templates"),
    },
  });
}

export function useCreateProposalTemplate() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  return useMutation<ProposalTemplate, Error, Omit<ProposalTemplateProperties, 'createdAt'> & { id: string }>({
    mutationFn: async (data) => {
      const token = await getAuthenticatedToken(firebaseUser);
      const newTemplateProperties = await createProposalTemplate(data, token);
      return new ProposalTemplate(newTemplateProperties);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.proposals() });
    },
    onError: (error: any) => {
      // Re-throw for form handling
      throw error;
    }
  });
}

export function useCreateReportTemplate() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  return useMutation<ReportTemplate, Error, Omit<ReportTemplateProperties, 'isDefault' | 'createdAt'> & { id: string }>({
    mutationFn: async (data) => {
      const token = await getAuthenticatedToken(firebaseUser);
      const newTemplateProperties = await createReportTemplate(data, token);
      return new ReportTemplate(newTemplateProperties);
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
  return useMutation<PresentationTemplate, Error, Omit<PresentationTemplateProperties, 'createdAt'> & { id: string }>({
    mutationFn: async (data) => {
      const token = await getAuthenticatedToken(firebaseUser);
      const newTemplateProperties = await createPresentationTemplate(data, token);
      return new PresentationTemplate(newTemplateProperties);
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
    mutationFn: async (variables: UpdateTemplateVariables<ProposalTemplate>) => {
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
    mutationFn: async (variables: UpdateTemplateVariables<ReportTemplate>) => {
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
    mutationFn: async (variables: UpdateTemplateVariables<PresentationTemplate>) => {
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
    mutationFn: async (variables: { templateId: string, prompt: string }) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return refreshTemplateImage({ ...variables, templateType }, token);
    },
    onSuccess: () => {
      toast({ title: "Image Refreshing", description: "The new preview image is being generated." });
      if (templateType === 'docx') {
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
