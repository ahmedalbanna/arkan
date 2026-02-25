
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/utils/authUtils';
import { toast } from '@/hooks/util/use-toast';
import {
    fetchPptxTemplatesApi,
    updatePptxTemplateApi,
    deletePptxTemplateApi,
    createPptxTemplateApi,
    refreshTemplateImage,
} from '@/modules/templates/adapters/api-client/TemplateApiClient';
import type { PptxTemplateProperties } from '@/lib/types';


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
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async ({ key, styles }: { key: string, styles: any }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return updatePptxTemplateApi(key, { styles }, token);
        },
        onSuccess: (data, { key }) => {
            toast({ title: "Template Saved", description: `Style changes for "${key}" have been saved.` });
            queryClient.invalidateQueries({ queryKey: ['pptx-styles'] });
        },
        onError: (error: any) => toast({ title: "Save Failed", description: error.message, variant: 'destructive' }),
    });
}

export function useDeletePptxTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (key: string) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deletePptxTemplateApi(key, token);
        },
        onSuccess: (data, key) => {
            toast({ title: 'Template Deleted', description: `Template "${key}" has been deleted.` });
            queryClient.invalidateQueries({ queryKey: ['pptx-styles'] });
        },
        onError: (error: any) => toast({ title: 'Delete Failed', description: error.message, variant: 'destructive' }),
    });
}

export function useCreatePptxTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (data: { id: string; name: string; description: string }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return createPptxTemplateApi(data, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pptx-styles'] });
        },
    });
}

export function useRefreshPptxTemplateImage() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (variables: { templateId: string, prompt: string }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return refreshTemplateImage({ ...variables, templateType: 'pptx' }, token);
        },
        onSuccess: () => {
            toast({ title: 'Image Refreshing', description: 'The new template preview is being generated.' });
            queryClient.invalidateQueries({ queryKey: ['pptx-styles'] });
        },
        onError: (error: any) => toast({ title: "Image Refresh Failed", description: error.message, variant: "destructive" })
    });
}
