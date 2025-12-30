
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/utils/authUtils';
import { toast } from '@/hooks/util/use-toast';
import {
    fetchDocxTemplatesApi,
    updateDocxTemplateApi,
    deleteDocxTemplateApi,
    createDocxTemplateApi,
    refreshTemplateImage,
} from '@/services/api/templateService';
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
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async ({ key, styles }: { key: string, styles: any }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return updateDocxTemplateApi(key, { styles }, token);
        },
        onSuccess: (data, { key }) => {
            toast({ title: "Template Saved", description: `Style changes for "${key}" have been saved.` });
            queryClient.invalidateQueries({ queryKey: ['docx-styles'] });
        },
        onError: (error: any) => toast({ title: "Save Failed", description: error.message, variant: 'destructive' }),
    });
}

export function useDeleteDocxTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (key: string) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deleteDocxTemplateApi(key, token);
        },
        onSuccess: (data, key) => {
            toast({ title: 'Template Deleted', description: `Template "${key}" has been deleted.` });
            queryClient.invalidateQueries({ queryKey: ['docx-styles'] });
        },
        onError: (error: any) => toast({ title: 'Delete Failed', description: error.message, variant: 'destructive' }),
    });
}

export function useCreateDocxTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (data: { id: string, name: string, description: string }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return createDocxTemplateApi(data, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['docx-styles'] });
        },
    });
}

export function useRefreshDocxTemplateImage() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (variables: { templateId: string, prompt: string }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return refreshTemplateImage({ ...variables, templateType: 'docx' }, token);
        },
        onSuccess: () => {
            toast({ title: 'Image Refreshing', description: 'The new template preview is being generated.' });
            queryClient.invalidateQueries({ queryKey: ['docx-styles'] });
        },
        onError: (error: any) => toast({ title: "Image Refresh Failed", description: error.message, variant: "destructive" })
    });
}
