
'use client';

import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { templateKeys } from '@/lib/core/query-keys';
import { handleErrorUtility } from '@/lib/errorUtils';
import { PresentationTemplate, type PresentationTemplateProperties } from '@/lib/models/presentationTemplate';
import { ProposalTemplate, type ProposalTemplateProperties } from '@/lib/models/proposalTemplate';
import { ReportTemplate, type ReportTemplateProperties } from '@/lib/models/reportTemplate';
import {
    createGenerativeTemplate,
    fetchPresentationTemplatesApi,
    fetchProposalTemplatesApi,
    fetchReportTemplatesApi,
    refreshTemplateImage as refreshTemplateImageApi,
    updatePresentationTemplateApi,
    updateProposalTemplateApi,
    updateReportTemplateApi
} from '@/services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';


// === Reusable hooks for each template type ===

export function useProposalTemplates() {
    return useQuery<ProposalTemplate[]>({
        queryKey: templateKeys.proposal(),
        queryFn: fetchProposalTemplatesApi,
        staleTime: 1000 * 60 * 5,
        select: (data) => data.map(t => new ProposalTemplate(t as ProposalTemplateProperties)),
        meta: { onError: (error: Error) => handleErrorUtility(error, "Failed to fetch proposal templates") },
    });
}

export function useReportTemplates() {
    return useQuery<ReportTemplate[]>({
        queryKey: templateKeys.report(),
        queryFn: fetchReportTemplatesApi,
        staleTime: 1000 * 60 * 5,
        select: (data) => data.map(t => new ReportTemplate(t as ReportTemplateProperties)),
        meta: { onError: (error: Error) => handleErrorUtility(error, "Failed to fetch report templates") },
    });
}

export function usePresentationTemplates() {
    return useQuery<PresentationTemplate[]>({
        queryKey: templateKeys.presentation(),
        queryFn: fetchPresentationTemplatesApi,
        staleTime: 1000 * 60 * 5,
        select: (data) => data.map(t => new PresentationTemplate(t as PresentationTemplateProperties)),
        meta: { onError: (error: Error) => handleErrorUtility(error, "Failed to fetch presentation templates") },
    });
}

export function useUpdateProposalTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation<any, Error, { templateId: string; data: Partial<ProposalTemplateProperties> }>({
        mutationFn: async ({ templateId, data }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return updateProposalTemplateApi(templateId, data, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: templateKeys.proposal() });
            toast({ title: 'Template Saved' });
        },
        onError: (error) => handleErrorUtility(error, "Failed to save template"),
    });
}

export function useUpdateReportTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation<any, Error, { templateId: string; data: Partial<ReportTemplateProperties> }>({
        mutationFn: async ({ templateId, data }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return updateReportTemplateApi(templateId, data, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: templateKeys.report() });
            toast({ title: 'Template Saved' });
        },
        onError: (error) => handleErrorUtility(error, 'Failed to save template'),
    });
}

export function useUpdatePresentationTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation<any, Error, { templateId: string; data: Partial<PresentationTemplateProperties> }>({
        mutationFn: async ({ templateId, data }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return updatePresentationTemplateApi(templateId, data, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: templateKeys.presentation() });
            toast({ title: 'Template Saved' });
        },
        onError: (error) => handleErrorUtility(error, 'Failed to save template'),
    });
}

export function useRefreshTemplateImage(templateType: 'docx' | 'pptx' | 'proposal' | 'report' | 'presentation') {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<any, Error, { templateId: string; prompt: string }>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return refreshTemplateImageApi({ ...variables, templateType }, token);
        },
        onSuccess: () => {
            let keyToInvalidate;
            switch (templateType) {
                case 'docx': keyToInvalidate = templateKeys.docx(); break;
                case 'pptx': keyToInvalidate = templateKeys.pptx(); break;
                case 'proposal': keyToInvalidate = templateKeys.proposal(); break;
                case 'report': keyToInvalidate = templateKeys.report(); break;
                case 'presentation': keyToInvalidate = templateKeys.presentation(); break;
            }
            if (keyToInvalidate) {
                queryClient.invalidateQueries({ queryKey: keyToInvalidate });
            }
            toast({ title: 'Image Refreshed', description: 'The preview image has been updated.' });
        },
        onError: (error) => {
            handleErrorUtility(error, 'Failed to refresh image');
        },
    });
}


export function useCreatePresentationTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (data: Omit<PresentationTemplateProperties, 'id'> & { id: string }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return createGenerativeTemplate('presentation', data.id, data, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: templateKeys.presentation() });
        },
        onError: (error) => {
            handleErrorUtility(error, "Failed to create presentation template");
            throw error;
        }
    });
}
