
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
  type ProposalTemplate,
  type ReportGenerationTemplate,
  type PresentationGenerationTemplate,
} from "@/services/template-service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "./use-toast";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";
import { docxTemplateKeys } from "./use-docx-styles";
import { pptxTemplateKeys } from "./use-pptx-styles";
import { templateKeys } from "@/lib/query-keys";
export { templateKeys };
// Define generic type for update template variables
interface UpdateTemplateVariables<T> {
  templateId: string;
  data: Partial<T>;
}

export function useProposalTemplates() {
  const { firebaseUser } = useAuth();
  return useQuery<ProposalTemplate[]>({
    queryKey: templateKeys.proposals(),
    queryFn: async () => {
        const token = await getAuthenticatedToken(firebaseUser);
        return fetchProposalTemplates(token);
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: {
      onError: (error: Error) => {
        handleErrorUtility(error, "Failed to fetch proposal templates");
      },
    },
  });
}

export function useReportTemplates() {
  const { firebaseUser } = useAuth();
  return useQuery<ReportGenerationTemplate[]>({
    queryKey: templateKeys.reports(),
    queryFn: async () => {
        const token = await getAuthenticatedToken(firebaseUser);
        return fetchReportTemplates(token);
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 5,
    meta: {
      onError: (error: Error) => {
        handleErrorUtility(error, "Failed to fetch report templates");
      },
    },
  });
}

export function usePresentationTemplates() {
  const { firebaseUser } = useAuth();
  return useQuery<PresentationGenerationTemplate[]>({
    queryKey: templateKeys.presentations(),
    queryFn: async () => {
        const token = await getAuthenticatedToken(firebaseUser);
        return fetchPresentationTemplates(token);
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 5,
    meta: {
      onError: (error: Error) => {
        handleErrorUtility(error, "Failed to fetch presentation templates");
      },
    },
  });
}

export function useUpdateProposalTemplate() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation<
    ProposalTemplate,
    Error,
    UpdateTemplateVariables<ProposalTemplate>
  >({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return updateProposalTemplate(
        variables.templateId,
        variables.data,
        token
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.proposals() });
      toast({
        title: "Template Updated",
        description: `Proposal template "${data.name}" has been updated.`,
      });
    },
    onError: (error: Error) => {
      handleErrorUtility(error, "Update Proposal Template Failed");
    },
  });
}

export function useUpdateReportTemplate() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation<
    ReportGenerationTemplate,
    Error,
    UpdateTemplateVariables<ReportGenerationTemplate>
  >({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return updateReportTemplate(variables.templateId, variables.data, token);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.reports() });
      toast({
        title: "Template Updated",
        description: `Report template "${data.name}" has been updated.`,
      });
    },
    onError: (error: Error) => {
      handleErrorUtility(error, "Update Report Template Failed");
    },
  });
}

export function useUpdatePresentationTemplate() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation<
    PresentationGenerationTemplate,
    Error,
    UpdateTemplateVariables<PresentationGenerationTemplate>
  >({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return updatePresentationTemplate(
        variables.templateId,
        variables.data,
        token
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.presentations() });
      toast({
        title: "Template Updated",
        description: `Presentation template "${data.name}" has been updated.`,
      });
    },
    onError: (error: Error) => {
      handleErrorUtility(error, "Update Presentation Template Failed");
    },
  });
}

// --- Create Mutations ---

export function useCreateProposalTemplate() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation<
    ProposalTemplate,
    Error,
    Omit<ProposalTemplate, 'id' | 'createdAt'> & {id: string}
  >({
    mutationFn: async (data) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return createProposalTemplate(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.proposals() });
    },
     onError: (error) => {
        // Re-throw the error to be caught by the form's onSubmit
        throw error;
    }
  });
}

export function useCreateReportTemplate() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation<
    ReportGenerationTemplate,
    Error,
    Omit<ReportGenerationTemplate, 'createdAt'> & {id: string}
  >({
    mutationFn: async (data) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return createReportTemplate(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.reports() });
    },
     onError: (error) => {
        throw error;
    }
  });
}

export function useCreatePresentationTemplate() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation<
    PresentationGenerationTemplate,
    Error,
    Omit<PresentationGenerationTemplate, 'createdAt'> & {id: string}
  >({
    mutationFn: async (data) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return createPresentationTemplate(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.presentations() });
    },
     onError: (error) => {
        throw error;
    }
  });
}

// --- Delete Mutations ---

export function useDeleteProposalTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<any, Error, string>({
        mutationFn: async (templateId: string) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deleteProposalTemplate(templateId, token);
        },
        onSuccess: (data, templateId) => {
            queryClient.invalidateQueries({ queryKey: templateKeys.proposals() });
            toast({ title: 'Template Deleted', description: `Template "${templateId}" was successfully deleted.` });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, "Delete Failed");
        }
    });
}

export function useDeleteReportTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<any, Error, string>({
        mutationFn: async (templateId: string) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deleteReportTemplate(templateId, token);
        },
        onSuccess: (data, templateId) => {
            queryClient.invalidateQueries({ queryKey: templateKeys.reports() });
            toast({ title: 'Template Deleted', description: `Template "${templateId}" was successfully deleted.` });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, "Delete Failed");
        }
    });
}

export function useDeletePresentationTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<any, Error, string>({
        mutationFn: async (templateId: string) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deletePresentationTemplate(templateId, token);
        },
        onSuccess: (data, templateId) => {
            queryClient.invalidateQueries({ queryKey: templateKeys.presentations() });
            toast({ title: 'Template Deleted', description: `Template "${templateId}" was successfully deleted.` });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, "Delete Failed");
        }
    });
}

export function useRefreshTemplateImage(templateType: 'docx' | 'pptx') {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation({
        mutationFn: async (variables: { templateId: string; prompt: string }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return refreshTemplateImage({ ...variables, templateType }, token);
        },
        onSuccess: () => {
            if (templateType === 'docx') {
                queryClient.invalidateQueries({ queryKey: docxTemplateKeys.lists() });
            } else if (templateType === 'pptx') {
                queryClient.invalidateQueries({ queryKey: pptxTemplateKeys.lists() });
            }
            toast({ title: 'Success', description: 'Template image has been refreshed.' });
        },
        onError: (error) => {
            handleErrorUtility(error, 'Image Refresh Failed');
        },
    });
}


