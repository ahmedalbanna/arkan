
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/util/use-toast';
import {
    getDocxTemplatesAction,
    createDocxTemplateAction,
    updateDocxTemplateAction,
    deleteDocxTemplateAction,
    refreshTemplateImageAction,
} from '@/app/actions/templateActions';
import type { DocxTemplateProperties } from '@/lib/models';
import { z } from 'zod';
import { DocxTemplateSchema } from '@/ai/schemas/template-schemas';


const UpdateDocxTemplateSchema = DocxTemplateSchema.pick({ styles: true });

export function useDocxStyles() {
    return useQuery<DocxTemplateProperties[]>({
        queryKey: ['docx-styles'],
        queryFn: getDocxTemplatesAction,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useUpdateDocxTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ key, styles }: { key: string, styles: z.infer<typeof UpdateDocxTemplateSchema> }) => updateDocxTemplateAction(key, { styles }),
        onSuccess: (_, { key }) => {
            toast({ title: "Template Saved", description: `Style changes for "${key}" have been saved.` });
            queryClient.invalidateQueries({ queryKey: ['docx-styles'] });
        },
        onError: (error: any) => toast({ title: "Save Failed", description: error.message, variant: 'destructive' }),
    });
}

export function useDeleteDocxTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (key: string) => deleteDocxTemplateAction(key),
        onSuccess: (_, key) => {
            toast({ title: 'Template Deleted', description: `Template "${key}" has been deleted.` });
            queryClient.invalidateQueries({ queryKey: ['docx-styles'] });
        },
        onError: (error: any) => toast({ title: 'Delete Failed', description: error.message, variant: 'destructive' }),
    });
}

export function useCreateDocxTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { id: string, name: string, description: string }) => createDocxTemplateAction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['docx-styles'] });
        },
    });
}

export function useRefreshDocxTemplateImage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (variables: { templateId: string, prompt: string }) => refreshTemplateImageAction({ ...variables, templateType: 'docx' }),
        onSuccess: () => {
            toast({ title: 'Image Refreshing', description: 'The new template preview is being generated.' });
            queryClient.invalidateQueries({ queryKey: ['docx-styles'] });
        },
        onError: (error: any) => toast({ title: "Image Refresh Failed", description: error.message, variant: "destructive" })
    });
}
