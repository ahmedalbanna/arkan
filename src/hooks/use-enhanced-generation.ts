'use client';

import { SectionName as SectionNameType } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useToast } from '@/hooks';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { handleErrorUtility } from '@/lib/errorUtils';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useSectionGenerationData } from './use-section-generation-data';

/**
 * Hook محسن لتوليد أقسام التقرير مع البيانات الجديدة
 */
export function useEnhancedReportSectionGenerator() {
    const { t } = useLocalization();
    const { firebaseUser, refetchUser } = useAuth();
    const { updateProject } = useBuilderStore();
    const { toast } = useToast();

    const generateMutation = useMutation({
        mutationFn: async (data: {
            sectionKey: SectionNameType;
            additionalData?: any;
        }) => {
            const { sectionKey, additionalData = {} } = data;

            // جمع البيانات من SectionAccordionItem
            const generationData = useSectionGenerationData(sectionKey);
            const apiData = generationData.prepareApiData(additionalData);

            // التحقق من صحة البيانات
            const validation = generationData.validateData();
            if (!validation.isValid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            const token = await getAuthenticatedToken(firebaseUser);

            const response = await fetch('/api/generate/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(apiData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        },
        onSuccess: (data, variables) => {
            // تحديث المشروع بالنتيجة
            updateProject(p => {
                p.setSection(variables.sectionKey, data.content);
            });

            // تحديث الرصيد
            refetchUser();

            // إظهار رسالة النجاح
            toast({
                title: t('builder.toasts.sectionGenerated'),
                description: t('builder.toasts.sectionGeneratedDesc'),
            });
        },
        onError: (error: Error, variables) => {
            console.error('Error generating section:', error);
            handleErrorUtility(error, 'section-generation');

            toast({
                title: t('builder.toasts.generationFailed'),
                description: error.message,
                variant: 'destructive'
            });
        }
    });

    const generateSection = useCallback((sectionKey: SectionNameType, additionalData?: any) => {
        generateMutation.mutate({ sectionKey, additionalData });
    }, [generateMutation]);

    return {
        generateSection,
        isGenerating: generateMutation.isPending,
        error: generateMutation.error,
        data: generateMutation.data,
        reset: generateMutation.reset
    };
}

/**
 * Hook محسن لتوليد المقترحات مع البيانات الجديدة
 */
export function useEnhancedProposalSectionGenerator() {
    const { t } = useLocalization();
    const { firebaseUser, refetchUser } = useAuth();
    const { updateProject } = useBuilderStore();
    const { toast } = useToast();

    const generateMutation = useMutation({
        mutationFn: async (data: {
            sectionKey: string;
            additionalData?: any;
        }) => {
            const { sectionKey, additionalData = {} } = data;

            // جمع البيانات من SectionAccordionItem
            const generationData = useSectionGenerationData(sectionKey);
            const apiData = generationData.prepareApiData(additionalData);

            // التحقق من صحة البيانات
            const validation = generationData.validateData();
            if (!validation.isValid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            const token = await getAuthenticatedToken(firebaseUser);

            const response = await fetch('/api/generate/proposal-section', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(apiData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        },
        onSuccess: (data, variables) => {
            // تحديث المشروع بالنتيجة
            updateProject(p => {
                p.setProposal(data.content);
            });

            // تحديث الرصيد
            refetchUser();

            // إظهار رسالة النجاح
            toast({
                title: t('builder.toasts.proposalGenerated'),
                description: t('builder.toasts.proposalGeneratedDesc'),
            });
        },
        onError: (error: Error, variables) => {
            console.error('Error generating proposal:', error);
            handleErrorUtility(error, 'proposal-generation');

            toast({
                title: t('builder.toasts.generationFailed'),
                description: error.message,
                variant: 'destructive'
            });
        }
    });

    const generateProposalSection = useCallback((sectionKey: string, additionalData?: any) => {
        generateMutation.mutate({ sectionKey, additionalData });
    }, [generateMutation]);

    return {
        generateProposalSection,
        isGenerating: generateMutation.isPending,
        error: generateMutation.error,
        data: generateMutation.data,
        reset: generateMutation.reset
    };
}
