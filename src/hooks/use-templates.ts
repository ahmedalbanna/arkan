
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
import { handleErrorUtility } from '@/lib/errorUtils';
import { getAuthenticatedToken } from '@/lib/authUtils';


export const templateKeys = {
    all: ['templates'] as const,
    proposals: () => [...templateKeys.all, 'proposal'] as const,
    reports: () => [...templateKeys.all, 'report'] as const,
    presentations: () => [...templateKeys.all, 'presentation'] as const,
}

// Define generic type for update template variables
interface UpdateTemplateVariables<T> {
    templateId: string;
    data: Partial<T>;
}

export function useProposalTemplates() {
    const { firebaseUser } = useAuth();
    return useQuery<ProposalTemplate[]>({
        queryKey: templateKeys.proposals(),
        queryFn: fetchProposalTemplates,
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!firebaseUser,
        meta:{
            onError: (error: Error) => {
                handleErrorUtility(error, 'Failed to fetch proposal templates');
            }
        }
    });
}

export function useReportTemplates() {
    const { firebaseUser } = useAuth();
    return useQuery<ReportGenerationTemplate[]>({
        queryKey: templateKeys.reports(),
        queryFn: fetchReportTemplates,
        staleTime: 1000 * 60 * 5,
        enabled: !!firebaseUser,
         meta:{
            onError: (error: Error) => {
                handleErrorUtility(error, 'Failed to fetch report templates');
            }
         }
    });
}

export function usePresentationTemplates() {
    const { firebaseUser } = useAuth();
    return useQuery<PresentationGenerationTemplate[]>({
        queryKey: templateKeys.presentations(),
        queryFn: fetchPresentationTemplates,
        staleTime: 1000 * 60 * 5,
        enabled: !!firebaseUser,
         meta:{
            onError: (error: Error) => {
                handleErrorUtility(error, 'Failed to fetch presentation templates');
            }
         }
    });
}


export function useUpdateProposalTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<ProposalTemplate, Error, UpdateTemplateVariables<ProposalTemplate>>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return updateProposalTemplate(variables.templateId, variables.data, token);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: templateKeys.proposals() });
            toast({
                title: 'Template Updated',
                description: `Proposal template "${data.name}" has been updated.`,
            });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, 'Update Proposal Template Failed');
        }
    });
}


export function useUpdateReportTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    
    return useMutation<ReportGenerationTemplate, Error, UpdateTemplateVariables<ReportGenerationTemplate>>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return updateReportTemplate(variables.templateId, variables.data, token);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: templateKeys.reports() });
             toast({
                title: 'Template Updated',
                description: `Report template "${data.name}" has been updated.`,
            });
        },
        onError: (error: Error) => {
             handleErrorUtility(error, 'Update Report Template Failed');
        }
    });
}

export function useUpdatePresentationTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    
    return useMutation<PresentationGenerationTemplate, Error, UpdateTemplateVariables<PresentationGenerationTemplate>>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return updatePresentationTemplate(variables.templateId, variables.data, token);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: templateKeys.presentations() });
             toast({
                title: 'Template Updated',
                description: `Presentation template "${data.name}" has been updated.`,
            });
        },
        onError: (error: Error) => {
             handleErrorUtility(error, 'Update Presentation Template Failed');
        }
    });
}
