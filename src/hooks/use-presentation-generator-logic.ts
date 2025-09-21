
'use client';

import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { toast, useGeneratePresentation } from '@/hooks';
import { translatePresentationApi } from '@/services';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useBuilderStore } from './useBuilderStore';
import { useGenerationUIStore } from './useGenerationUIStore';

export function usePresentationGeneratorLogic() {
    const { t, locale } = useLocalization();
    const { firebaseUser } = useAuth();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const { project, updateProject } = useBuilderStore();

    const { activePresentationId } = useGenerationUIStore();

    const generationMutation = useGeneratePresentation();

    const translateMutation = useMutation({
        mutationFn: translatePresentationApi,
        onSuccess: (data) => {
            if (!project) return;

            const updatedHistory = project.presentation?.history.map(p =>
                p.id === data.id ? data : p
            ) || [];

            updateProject(p => {
                p.presentation!.history = updatedHistory;
            });

            toast({
                title: t('builder.presentationGenerator.toasts.translateAllSuccess'),
                description: t('builder.presentationGenerator.toasts.translateAllSuccessDesc'),
            });
        },
        onError: (error: Error) => {
            toast({
                title: t('builder.presentationGenerator.toasts.translateAllFailed'),
                description: error.message || t('builder.presentationGenerator.toasts.translateAllFailedDesc'),
                variant: 'destructive'
            });
        }
    });

    const onGenerate = async (body: any) => {
        if (!firebaseUser) {
            toast({ title: t('builder.toasts.authError'), description: t('builder.presentationGenerator.toasts.authError'), variant: "destructive" });
            return;
        }
        const token = await firebaseUser.getIdToken();
        generationMutation.mutate({ body: { ...body, templateId: 'default' }, token });
    };

    const handleTranslateAll = async (targetLang: 'en' | 'ar') => {
        const activePresentation = project?.presentation?.history.find(p => p.id === activePresentationId);
        if (!activePresentation || !firebaseUser) return;

        toast({
            title: t('builder.presentationGenerator.toasts.translateAllStarted'),
            description: t('builder.presentationGenerator.toasts.translateAllStartedDesc'),
        });

        const token = await firebaseUser.getIdToken();
        translateMutation.mutate({ presentation: activePresentation, targetLang, token });
    };

    const activePresentation = project?.presentation?.history.find(p => p.id === activePresentationId);

    return {
        t,
        locale,
        isPanelCollapsed,
        setIsPanelCollapsed,
        generationMutation,
        translateMutation,
        onGenerate,
        handleTranslateAll,
        activePresentation,
    };
}

    