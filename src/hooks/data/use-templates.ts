
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
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
} from '@/services/api/templateService';
import {
    type ReportTemplateProperties,
    type PptxTemplateProperties,
    type CreateReportTemplateData,
    type UpdateReportTemplateData,
    type CreatePresentationTemplateData,
    type UpdatePresentationTemplateData,
} from '@/lib/types';

import { useBuilderStore } from '../core/useBuilderStore';
import { useState } from 'react';
import { useSections } from './use-sections';


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
    const { project, updateProject } = useBuilderStore();
    const { data: allSections } = useSections();
    const [isApplying, setIsApplying] = useState(false);

    const handleSelectTemplate = (template: ReportTemplateProperties) => {
        if (!project) {
            toast({ title: 'Error', description: 'Project data not available.', variant: 'destructive' });
            return;
        }

        setIsApplying(true);
        try {
            updateProject(p => p.applyTemplate(template, (allSections || []).map(s => s.toStateObject())));
            toast({ title: "Template Applied", description: `Project structured with '${template.name}'.` });
            if (onSuccessCallback) {
                onSuccessCallback();
            }
        } catch (error) {
            toast({ title: 'Failed to Apply Template', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
        } finally {
            setIsApplying(false);
        }
    };
    
    return {
        handleSelectTemplate,
        isApplyingTemplate: isApplying,
    };
}


export function useCreateReportTemplate() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation({
        mutationFn: async (data: CreateReportTemplateData) => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            return createReportTemplateApi(data, session.user.id);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['report-templates'] }),
        onError: (error: any) => toast({ title: 'Creation Failed', description: error.message, variant: 'destructive' }),
    });
}

export function useUpdateReportTemplate() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation({
        mutationFn: async ({ templateId, data }: { templateId: string; data: UpdateReportTemplateData }) => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            return updateReportTemplateApi(templateId, data, session.user.id);
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
    const { data: session } = useSession();
    return useMutation({
        mutationFn: async (templateId: string) => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            return deleteReportTemplateApi(templateId, session.user.id);
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
    return useQuery<PptxTemplateProperties[]>({
        queryKey: ['presentation-templates'],
        // @ts-expect-error - fetchPresentationTemplatesApi return type mismatch
        queryFn: fetchPresentationTemplatesApi,
    });
}


export function useCreatePresentationTemplate() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation({
        mutationFn: async (data: CreatePresentationTemplateData) => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            return createPresentationTemplateApi(data, session.user.id);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['presentation-templates'] }),
        onError: (error: any) => toast({ title: 'Creation Failed', description: error.message, variant: 'destructive' }),
    });
}

export function useUpdatePresentationTemplate() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation({
        mutationFn: async ({ templateId, data }: { templateId: string; data: UpdatePresentationTemplateData }) => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            return updatePresentationTemplateApi(templateId, data, session.user.id);
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
    const { data: session } = useSession();
    return useMutation({
        mutationFn: async (templateId: string) => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            return deletePresentationTemplateApi(templateId, session.user.id);
        },
        onSuccess: () => {
            toast({ title: 'Template Deleted' });
            queryClient.invalidateQueries({ queryKey: ['presentation-templates'] });
        },
        onError: (error: any) => toast({ title: 'Delete Failed', description: error.message, variant: 'destructive' }),
    });
}
