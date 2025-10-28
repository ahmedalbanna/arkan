
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
    fetchPptxTemplatesApi,
    updatePptxTemplateApi,
    deletePptxTemplateApi,
    createPptxTemplateApi,
    fetchReportTemplatesApi,
    createReportTemplateApi,
    updateReportTemplateApi,
    deleteReportTemplateApi,
    fetchPresentationTemplatesApi,
    createPresentationTemplateApi,
    updatePresentationTemplateApi,
    deletePresentationTemplateApi,
} from '@/services/api/templateService';
import type { DocxTemplateProperties, PptxTemplateProperties, ReportTemplateProperties, PresentationTemplateProperties, CreateReportTemplateData, UpdateReportTemplateData, CreatePresentationTemplateData, UpdatePresentationTemplateData } from '@/lib/types';


// ============================================================================
// DOCX TEMPLATES
// ============================================================================

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


// ============================================================================
// PPTX TEMPLATES
// ============================================================================

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
        mutationFn: async (data: { id: string, name: string, description: string }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return createPptxTemplateApi(data, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pptx-styles'] });
        },
    });
}

// ============================================================================
// REPORT GENERATION TEMPLATES
// ============================================================================

export function useReportTemplates() {
    return useQuery<ReportTemplateProperties[]>({
        queryKey: ['report-templates'],
        queryFn: fetchReportTemplatesApi,
    });
}

export function useCreateReportTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (data: CreateReportTemplateData) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return createReportTemplateApi(data, token);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['report-templates'] }),
        onError: (error: any) => toast({ title: 'Creation Failed', description: error.message, variant: 'destructive' }),
    });
}

export function useUpdateReportTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async ({ templateId, data }: { templateId: string; data: UpdateReportTemplateData }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return updateReportTemplateApi(templateId, data, token);
        },
        onSuccess: () => {
            toast({ title: 'Template Updated', description: 'Report template has been saved.' });
            queryClient.invalidateQueries({ queryKey: ['report-templates'] });
        },
        onError: (error: any) => toast({ title: 'Update Failed', description: error.message, variant: 'destructive' }),
    });
}

export function useDeleteReportTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (templateId: string) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deleteReportTemplateApi(templateId, token);
        },
        onSuccess: () => {
            toast({ title: 'Template Deleted' });
            queryClient.invalidateQueries({ queryKey: ['report-templates'] });
        },
        onError: (error: any) => toast({ title: 'Delete Failed', description: error.message, variant: 'destructive' }),
    });
}

// ============================================================================
// PRESENTATION GENERATION TEMPLATES
// ============================================================================

export function usePresentationTemplates() {
    return useQuery<PresentationTemplateProperties[]>({
        queryKey: ['presentation-templates'],
        queryFn: fetchPresentationTemplatesApi,
    });
}


export function useCreatePresentationTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (data: CreatePresentationTemplateData) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return createPresentationTemplateApi(data, token);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['presentation-templates'] }),
        onError: (error: any) => toast({ title: 'Creation Failed', description: error.message, variant: 'destructive' }),
    });
}

export function useUpdatePresentationTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async ({ templateId, data }: { templateId: string; data: UpdatePresentationTemplateData }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return updatePresentationTemplateApi(templateId, data, token);
        },
        onSuccess: () => {
            toast({ title: 'Template Updated', description: 'Presentation template has been saved.' });
            queryClient.invalidateQueries({ queryKey: ['presentation-templates'] });
        },
        onError: (error: any) => toast({ title: 'Update Failed', description: error.message, variant: 'destructive' }),
    });
}

export function useDeletePresentationTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (templateId: string) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deletePresentationTemplateApi(templateId, token);
        },
        onSuccess: () => {
            toast({ title: 'Template Deleted' });
            queryClient.invalidateQueries({ queryKey: ['presentation-templates'] });
        },
        onError: (error: any) => toast({ title: 'Delete Failed', description: error.message, variant: 'destructive' }),
    });
}
