'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@/infrastructure/di/container';
import { TemplateApiClient } from '@/modules/templates/adapters/api-client/TemplateApiClient';
import { templateKeys } from '@/lib/query-keys';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/util/use-toast';

export function useTemplates(type: 'docx' | 'pptx' | 'report') {
  const { firebaseUser } = useAuth();

  return useQuery({
    queryKey: templateKeys.lists(type),
    queryFn: async () => {
      if (!firebaseUser) return [];
      const client = container.resolve(TemplateApiClient);
      let result;
      if (type === 'docx') result = await client.fetchDocxTemplatesApi();
      else if (type === 'pptx') result = await client.fetchPptxTemplatesApi();
      else result = await client.fetchReportTemplatesApi();

      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    enabled: !!firebaseUser,
  });
}

export function useTemplate(type: 'docx' | 'pptx' | 'report', id: string) {
  const { firebaseUser } = useAuth();

  return useQuery({
    queryKey: templateKeys.detail(type, id),
    queryFn: async () => {
      if (!firebaseUser || !id) return null;
      const client = container.resolve(TemplateApiClient);
      let result;
      if (type === 'docx') result = await client.fetchDocxTemplateByIdApi(id);
      else if (type === 'pptx') result = await client.fetchPptxTemplateByIdApi(id);
      else result = await client.fetchReportTemplateByIdApi(id);

      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    enabled: !!firebaseUser && !!id,
  });
}

export function useSaveTemplate(type: 'docx' | 'pptx' | 'report') {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const client = container.resolve(TemplateApiClient);
      let result;
      if (type === 'docx') result = await client.saveDocxTemplateApi({ id, data });
      else if (type === 'pptx') result = await client.savePptxTemplateApi({ id, data });
      else result = await client.saveReportTemplateApi({ id, data });

      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists(type) });
      if (data.id) {
        queryClient.invalidateQueries({ queryKey: templateKeys.detail(type, data.id) });
      }
      toast({ title: 'Success', description: 'Template saved successfully.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to save template.', variant: 'destructive' });
    },
  });
}

export function useDeleteTemplate(type: 'docx' | 'pptx' | 'report') {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const client = container.resolve(TemplateApiClient);
      let result;
      if (type === 'docx') result = await client.deleteDocxTemplateApi(id);
      else if (type === 'pptx') result = await client.deletePptxTemplateApi(id);
      else result = await client.deleteReportTemplateApi(id);

      if (result.isFailure) throw result.error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists(type) });
      queryClient.removeQueries({ queryKey: templateKeys.detail(type, id) });
      toast({ title: 'Success', description: 'Template deleted successfully.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to delete template.', variant: 'destructive' });
    },
  });
}

// Aliases for compatibility
export const useReportTemplates = () => useTemplates('report');
export const useDeleteReportTemplate = () => useDeleteTemplate('report');
export const useApplyReportTemplate = () => {
    const mutation = useMutation({
        mutationFn: async ({ templateId, projectId }: { templateId: string, projectId: string }) => {
            console.log('Applying template', templateId, 'to project', projectId);
        }
    });
    
    return {
        ...mutation,
        handleSelectTemplate: (templateId: string, projectId: string) => mutation.mutate({ templateId, projectId }),
        isApplyingTemplate: mutation.isPending
    };
};
