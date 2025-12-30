
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/utils/authUtils';
import { toast } from '@/hooks/util/use-toast';
import {
    fetchReportTemplatesApi,
    createReportTemplateApi,
    updateReportTemplateApi,
    deleteReportTemplateApi,
    fetchPresentationTemplatesApi,
    createPresentationTemplateApi,
    updatePresentationTemplateApi,
    deletePresentationTemplateApi,
    applyReportTemplateApi,
} from '@/services/api/templateService';
import type { ReportTemplateProperties, CreateReportTemplateData, UpdateReportTemplateData, PresentationTemplateProperties, CreatePresentationTemplateData, UpdatePresentationTemplateData, ProjectProperties } from '@/lib/models';
import { useBuilderStore } from '../core/useBuilderStore';

// ============================================================================
// REPORT GENERATION TEMPLATES
// ============================================================================

export function useReportTemplates() {
    return useQuery<ReportTemplateProperties[]>({
        queryKey: ['report-templates'],
        queryFn: fetchReportTemplatesApi,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useApplyReportTemplate(onSuccessCallback?: () => void) {
    const { loadProject, project } = useBuilderStore();
    const { firebaseUser } = useAuth();

    const mutation = useMutation({
        mutationFn: async (template: ReportTemplateProperties) => {
            if (!project) throw new Error("No active project to apply the template to.");
            const token = await getAuthenticatedToken(firebaseUser);
            const projectData = project.toStateObject(); // Get plain object
            return applyReportTemplateApi({ project: projectData, template, token });
        },
        onSuccess: (newProjectData) => {
            loadProject(newProjectData);
            toast({
                title: 'Template Applied',
                description: 'Your project has been structured with the selected template.',
            });
            onSuccessCallback?.();
        },
        onError: (error: any) => {
            toast({ title: 'Failed to Apply Template', description: error.message, variant: 'destructive' });
        }
    });

    return {
        handleSelectTemplate: mutation.mutate,
        isApplyingTemplate: mutation.isPending,
    };
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
