
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from '@/hooks/util/use-toast';
import {
    fetchPptxTemplatesApi,
    updatePptxTemplateApi,
    deletePptxTemplateApi,
    createPptxTemplateApi,
    refreshTemplateImage,
} from '@/services/api/templateService';
import type { PptxTemplateProperties } from '@/lib/models';


export function usePptxStyles() {
    const { data: templates, ...rest } = useQuery<Record<string, PptxTemplateProperties>>({
        queryKey: ['pptx-styles'],
        queryFn: fetchPptxTemplatesApi,
        staleTime: 1000 * 60 * 60,
    });
    return { templates: templates || {}, ...rest };
}

export function useUpdatePptxTemplate() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation({
        mutationFn: async ({ key, styles }: { key: string, styles: Record<string, unknown> }) => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            return updatePptxTemplateApi(key, { styles }, session.user.id);
        },
        onSuccess: (data, { key }) => {
            toast({ title: "Template Saved", description: `Style changes for "${key}" have been saved.` });
            queryClient.invalidateQueries({ queryKey: ['pptx-styles'] });
        },
        onError: (error) => toast({ title: "Save Failed", description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' }),
    });
}

export function useDeletePptxTemplate() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation({
        mutationFn: async (key: string) => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            return deletePptxTemplateApi(key, session.user.id);
        },
        onSuccess: (data, key) => {
            toast({ title: 'Template Deleted', description: `Template "${key}" has been deleted.` });
            queryClient.invalidateQueries({ queryKey: ['pptx-styles'] });
        },
        onError: (error) => toast({ title: 'Delete Failed', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' }),
    });
}

export function useCreatePptxTemplate() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation({
        mutationFn: async (data: { id: string, name: string, description: string }) => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            return createPptxTemplateApi(data, session.user.id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pptx-styles'] });
        },
    });
}

export function useRefreshPptxTemplateImage() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation({
        mutationFn: async (variables: { templateId: string, prompt: string }) => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            return refreshTemplateImage({ ...variables, templateType: 'pptx' }, session.user.id);
        },
        onSuccess: () => {
            toast({ title: 'Image Refreshing', description: 'The new template preview is being generated.' });
            queryClient.invalidateQueries({ queryKey: ['pptx-styles'] });
        },
        onError: (error) => toast({ title: "Image Refresh Failed", description: error instanceof Error ? error.message : 'Unknown error', variant: "destructive" })
    });
}
