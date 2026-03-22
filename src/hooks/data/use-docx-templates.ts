'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/util/use-toast';
import { TemplateApiClient } from '@/modules/templates/adapters/api-client/TemplateApiClient';
import { templateKeys } from '@/lib/query-keys';
import type { DocxTemplateProperties } from '@/lib/types';
import { runAuthenticatedResultCall, unwrapResult } from './authenticated-client-call';

export function useDocxStyles() {
  const { data: templates, ...rest } = useQuery<Record<string, DocxTemplateProperties>>({
    queryKey: templateKeys.docx(),
    queryFn: async () => unwrapResult(await new TemplateApiClient().fetchDocxTemplatesApi()),
    staleTime: 1000 * 60 * 60,
  });

  return { templates: templates || {}, ...rest };
}

export function useUpdateDocxTemplate() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async ({ key, styles }: { key: string; styles: unknown }) =>
      runAuthenticatedResultCall(firebaseUser, TemplateApiClient, (client, token) =>
        client.updateDocxTemplateApi(key, { styles } as Partial<DocxTemplateProperties>, token),
      ),
    onSuccess: (_data, { key }) => {
      toast({ title: 'Template Saved', description: `Style changes for "${key}" have been saved.` });
      queryClient.invalidateQueries({ queryKey: templateKeys.docx() });
    },
    onError: (error: unknown) => {
      const description = error instanceof Error ? error.message : 'Save failed';
      toast({ title: 'Save Failed', description, variant: 'destructive' });
    },
  });
}

export function useDeleteDocxTemplate() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (key: string) =>
      runAuthenticatedResultCall(firebaseUser, TemplateApiClient, (client, token) =>
        client.deleteDocxTemplateApi(key, token),
      ),
    onSuccess: (_data, key) => {
      toast({ title: 'Template Deleted', description: `Template "${key}" has been deleted.` });
      queryClient.invalidateQueries({ queryKey: templateKeys.docx() });
    },
    onError: (error: unknown) => {
      const description = error instanceof Error ? error.message : 'Delete failed';
      toast({ title: 'Delete Failed', description, variant: 'destructive' });
    },
  });
}

export function useCreateDocxTemplate() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (data: { id: string; name: string; description: string }) =>
      runAuthenticatedResultCall(firebaseUser, TemplateApiClient, (client, token) =>
        client.createDocxTemplateApi(data, token),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.docx() });
    },
  });
}

export function useRefreshDocxTemplateImage() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (variables: { templateId: string; prompt: string }) =>
      runAuthenticatedResultCall(firebaseUser, TemplateApiClient, (client, token) =>
        client.refreshTemplateImage({ ...variables, templateType: 'docx' }, token),
      ),
    onSuccess: () => {
      toast({ title: 'Image Refreshing', description: 'The new template preview is being generated.' });
      queryClient.invalidateQueries({ queryKey: templateKeys.docx() });
    },
    onError: (error: unknown) => {
      const description = error instanceof Error ? error.message : 'Image refresh failed';
      toast({ title: 'Image Refresh Failed', description, variant: 'destructive' });
    },
  });
}
