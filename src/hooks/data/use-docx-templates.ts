
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from '@/hooks/util/use-toast';
import {
    fetchDocxTemplatesApi,
    updateDocxTemplateApi,
    deleteDocxTemplateApi,
    createDocxTemplateApi,
    refreshTemplateImage,
} from '@/services';
import type { DocxTemplateProperties } from '@/lib/models';

export function useDocxStyles() {
    const { data: templates, ...rest } = useQuery<Record<string, DocxTemplateProperties>>({
        queryKey: ['docx-styles'],
        queryFn: fetchDocxTemplatesApi,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
    return { templates: templates || {}, ...rest };
}

export function useUpdateDocxTemplate() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation({
        mutationFn: async ({ key, styles }: { key: string, styles: Record<string, unknown> }) => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            return updateDocxTemplateApi(key, { styles }, session.user.id);
        },
        onSuccess: (data, { key }) => {
            toast({ title: "Template Saved", description: `Style changes for "${key}" have been saved.` });
            queryClient.invalidateQueries({ queryKey: ['docx-styles'] });
        },
        onError: (error) => toast({ title: "Save Failed", description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' }),
    });
}

export function useDeleteDocxTemplate() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation({
        mutationFn: async (key: string) => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            return deleteDocxTemplateApi(key, session.user.id);
        },
        onSuccess: (data, key) => {
            toast({ title: 'Template Deleted', description: `Template "${key}" has been deleted.` });
            queryClient.invalidateQueries({ queryKey: ['docx-styles'] });
        },
        onError: (error) => toast({ title: 'Delete Failed', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' }),
    });
}

export function useCreateDocxTemplate() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation({
        mutationFn: async (data: { id: string, name: string, description: string }) => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            return createDocxTemplateApi(data, session.user.id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['docx-styles'] });
        },
    });
}

export function useRefreshDocxTemplateImage() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation({
        mutationFn: async (variables: { templateId: string, prompt: string }) => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            return refreshTemplateImage({ ...variables, templateType: 'docx' }, session.user.id);
        },
        onSuccess: () => {
            toast({ title: 'Image Refreshing', description: 'The new template preview is being generated.' });
            queryClient.invalidateQueries({ queryKey: ['docx-styles'] });
        },
        onError: (error) => toast({ title: "Image Refresh Failed", description: error instanceof Error ? error.message : 'Unknown error', variant: "destructive" })
    });
}
