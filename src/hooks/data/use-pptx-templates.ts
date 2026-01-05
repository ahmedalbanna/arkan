
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/util/use-toast';
import {
    getPptxTemplatesAction,
    createPptxTemplateAction,
    updatePptxTemplateAction,
    deletePptxTemplateAction,
    refreshTemplateImageAction,
} from '@/app/actions/templateActions';
import type { PptxTemplateProperties } from '@/lib/models';
import { z } from 'zod';

const PptxTemplatePropertiesSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    styles: z.array(z.string()),
    imageUrl: z.string().optional(),
    createdAt: z.string(),
});

const UpdatePptxTemplateSchema = PptxTemplatePropertiesSchema.pick({ styles: true });

export function usePptxStyles() {
    return useQuery<PptxTemplateProperties[]>({
        queryKey: ['pptx-styles'],
        queryFn: getPptxTemplatesAction,
        staleTime: 1000 * 60 * 60,
    });
}

export function useUpdatePptxTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ key, styles }: { key: string, styles: z.infer<typeof UpdatePptxTemplateSchema> }) => updatePptxTemplateAction(key, { styles }),
        onSuccess: (_, { key }) => {
            toast({ title: "Template Saved", description: `Style changes for "${key}" have been saved.` });
            queryClient.invalidateQueries({ queryKey: ['pptx-styles'] });
        },
        onError: (error: any) => toast({ title: "Save Failed", description: error.message, variant: 'destructive' }),
    });
}

export function useDeletePptxTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (key: string) => deletePptxTemplateAction(key),
        onSuccess: (_, key) => {
            toast({ title: 'Template Deleted', description: `Template "${key}" has been deleted.` });
            queryClient.invalidateQueries({ queryKey: ['pptx-styles'] });
        },
        onError: (error: any) => toast({ title: 'Delete Failed', description: error.message, variant: 'destructive' }),
    });
}

export function useCreatePptxTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { id: string; name: string; description: string }) => createPptxTemplateAction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pptx-styles'] });
        },
    });
}

export function useRefreshPptxTemplateImage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (variables: { templateId: string, prompt: string }) => refreshTemplateImageAction({ ...variables, templateType: 'pptx' }),
        onSuccess: () => {
            toast({ title: 'Image Refreshing', description: 'The new template preview is being generated.' });
            queryClient.invalidateQueries({ queryKey: ['pptx-styles'] });
        },
        onError: (error: any) => toast({ title: "Image Refresh Failed", description: error.message, variant: "destructive" })
    });
}
