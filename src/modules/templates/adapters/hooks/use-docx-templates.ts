'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/util/use-toast';
import { TemplateApiClient } from '@/modules/templates/adapters/api-client/TemplateApiClient';
import { templateKeys } from '@/infrastructure/api/query-keys';
import { type DocxTemplateProperties } from '@/modules/templates/domain/entities/DocxTemplate';
import { container } from '@/infrastructure/di/container';

export function useDocxStyles() {
  const { data: templates, ...rest } = useQuery<Record<string, DocxTemplateProperties>>({
    queryKey: templateKeys.docx(),
    queryFn: async (): Promise<Record<string, DocxTemplateProperties>> => {
        const result = await container.resolve(TemplateApiClient).fetchDocxTemplates();
        if (result.isFailure) throw result.error;
        const list = result.getValue();
        return list.reduce((acc, t) => ({ ...acc, [t.id]: t as DocxTemplateProperties }), {} as Record<string, DocxTemplateProperties>);
    },
    staleTime: 1000 * 60 * 60,
  });

  return { templates: templates || {}, ...rest };
}

export function useUpdateDocxTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, styles }: { key: string; styles: unknown }) => {
        const client = container.resolve(TemplateApiClient);
        const result = await client.saveDocxTemplate({ id: key, data: { styles } });
        if (result.isFailure) throw result.error;
        return result.getValue();
    },
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

  return useMutation({
    mutationFn: async (key: string) => {
        const client = container.resolve(TemplateApiClient);
        const result = await client.deleteDocxTemplate(key);
        if (result.isFailure) throw result.error;
        return result.getValue();
    },
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

  return useMutation({
    mutationFn: async (data: { id: string; name: string; description: string }) => {
        const client = container.resolve(TemplateApiClient);
        const result = await client.saveDocxTemplate({ id: data.id, data });
        if (result.isFailure) throw result.error;
        return result.getValue();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.docx() });
    },
  });
}

export function useRefreshDocxTemplateImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: { templateId: string; prompt: string }) => {
        throw new Error("Image refresh not implemented for SQLite templates yet");
    },
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
