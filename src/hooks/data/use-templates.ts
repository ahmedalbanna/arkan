
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
} from '@/modules/templates/adapters/api-client/TemplateApiClient';


import { useBuilderStore } from '../core/useBuilderStore';
import { useState } from 'react';
import { useSections } from './use-sections';
import { applyReportTemplate as applyReportTemplateUtil } from '@/lib/project/template';
import { CreateReportTemplateData, ReportTemplateProperties, UpdateReportTemplateData } from '@/modules/templates/domain/entities/ReportTemplate';
import { PptxTemplateProperties } from '@/modules/templates/domain/entities/PptxTemplate';


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
            updateProject(p => applyReportTemplateUtil(p, template));
            toast({ title: "Template Applied", description: `Project structured with '${template.name}'.` });
            if (onSuccessCallback) {
                onSuccessCallback();
            }
        } catch (error: any) {
            toast({ title: 'Failed to Apply Template', description: error.message, variant: 'destructive' });
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
    return useQuery<PptxTemplateProperties[]>({
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
