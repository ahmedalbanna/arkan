
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/util/use-toast';
import {
    getReportTemplatesAction,
    createReportTemplateAction,
    updateReportTemplateAction,
    deleteReportTemplateAction,
} from '@/app/actions/templateActions';

import {
    type ReportTemplateProperties,
    CreateReportTemplateSchema,
    UpdateReportTemplateSchema,
} from '@/lib/models';

import { useBuilderStore } from '../core/useBuilderStore';
import { useState } from 'react';
import { useSections } from './use-sections';
import { z } from 'zod';

// Correctly infer types from Zod schemas
type CreateReportTemplateData = z.infer<typeof CreateReportTemplateSchema>;
type UpdateReportTemplateData = z.infer<typeof UpdateReportTemplateSchema>;

// ============================================================================
// REPORT GENERATION TEMPLATES
// ============================================================================

export function useReportTemplates() {
    return useQuery<ReportTemplateProperties[]>({
        queryKey: ['report-templates'],
        queryFn: getReportTemplatesAction,
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
            updateProject(p => p.applyTemplate(template, allSections || []));
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
    return useMutation({
        mutationFn: (data: CreateReportTemplateData) => createReportTemplateAction(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['report-templates'] }),
        onError: (error: any) => toast({ title: 'Creation Failed', description: error.message, variant: 'destructive' }),
    });
}

export function useUpdateReportTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ templateId, data }: { templateId: string; data: UpdateReportTemplateData }) => updateReportTemplateAction(templateId, data),
        onSuccess: () => {
            toast({ title: 'Template Updated', description: 'Report template has been saved.' });
            queryClient.invalidateQueries({ queryKey: ['report-templates'] });
        },
        onError: (error: any) => toast({ title: 'Update Failed', description: error.message, variant: 'destructive' }),
    });
}

export function useDeleteReportTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (templateId: string) => deleteReportTemplateAction(templateId),
        onSuccess: () => {
            toast({ title: 'Template Deleted' });
            queryClient.invalidateQueries({ queryKey: ['report-templates'] });
        },
        onError: (error: any) => toast({ title: 'Delete Failed', description: error.message, variant: 'destructive' }),
    });
}
