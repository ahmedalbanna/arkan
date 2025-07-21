
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchProposalTemplates,
    fetchReportTemplates,
    fetchPresentationTemplates,
    updateProposalTemplate,
    updateReportTemplate,
    updatePresentationTemplate,
    type ProposalTemplate,
    type ReportGenerationTemplate,
    type PresentationGenerationTemplate,
} from '@/services/template-service';
import { useAuth } from '@/context/AuthContext';
import { toast } from './use-toast';


export const templateKeys = {
    all: ['templates'] as const,
    proposals: () => [...templateKeys.all, 'proposal'] as const,
    reports: () => [...templateKeys.all, 'report'] as const,
    presentations: () => [...templateKeys.all, 'presentation'] as const,
}

export function useProposalTemplates() {
    const { firebaseUser } = useAuth();
    return useQuery<ProposalTemplate[]>({
        queryKey: templateKeys.proposals(),
        queryFn: fetchProposalTemplates,
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!firebaseUser
    });
}

export function useReportTemplates() {
    const { firebaseUser } = useAuth();
    return useQuery<ReportGenerationTemplate[]>({
        queryKey: templateKeys.reports(),
        queryFn: fetchReportTemplates,
        staleTime: 1000 * 60 * 5,
        enabled: !!firebaseUser
    });
}

export function usePresentationTemplates() {
    const { firebaseUser } = useAuth();
    return useQuery<PresentationGenerationTemplate[]>({
        queryKey: templateKeys.presentations(),
        queryFn: fetchPresentationTemplates,
        staleTime: 1000 * 60 * 5,
        enabled: !!firebaseUser
    });
}


export function useUpdateProposalTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation({
        mutationFn: (variables: { templateId: string; data: Partial<ProposalTemplate> }) => {
            if (!firebaseUser) throw new Error("Not authenticated");
            const tokenPromise = firebaseUser.getIdToken();
            return tokenPromise.then(token => updateProposalTemplate(variables.templateId, variables.data, token));
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: templateKeys.proposals() });
            toast({
                title: 'Template Updated',
                description: `Proposal template "${data.name}" has been updated.`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Update Failed',
                description: error.message,
                variant: 'destructive',
            });
        }
    });
}


export function useUpdateReportTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    
    return useMutation({
        mutationFn: (variables: { templateId: string; data: Partial<ReportGenerationTemplate> }) => {
            if (!firebaseUser) throw new Error("Not authenticated");
            const tokenPromise = firebaseUser.getIdToken();
            return tokenPromise.then(token => updateReportTemplate(variables.templateId, variables.data, token));
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: templateKeys.reports() });
             toast({
                title: 'Template Updated',
                description: `Report template "${data.name}" has been updated.`,
            });
        },
        onError: (error: Error) => {
             toast({
                title: 'Update Failed',
                description: error.message,
                variant: 'destructive',
            });
        }
    });
}

export function useUpdatePresentationTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    
    return useMutation({
        mutationFn: (variables: { templateId: string; data: Partial<PresentationGenerationTemplate> }) => {
            if (!firebaseUser) throw new Error("Not authenticated");
            const tokenPromise = firebaseUser.getIdToken();
            return tokenPromise.then(token => updatePresentationTemplate(variables.templateId, variables.data, token));
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: templateKeys.presentations() });
             toast({
                title: 'Template Updated',
                description: `Presentation template "${data.name}" has been updated.`,
            });
        },
        onError: (error: Error) => {
             toast({
                title: 'Update Failed',
                description: error.message,
                variant: 'destructive',
            });
        }
    });
}
