
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { usePresentationStore } from '@/hooks';
import { useGeneratePresentation } from '@/hooks';
import { translatePresentationApi } from '@/services';
import { toast } from '@/hooks';
import { useBuilderStore } from './useBuilderStore';
import { Project } from '@/lib/models/project';

export function usePresentationGeneratorLogic() {
    const { t, locale } = useLocalization();
    const { firebaseUser } = useAuth();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    
    // Get project data from the central store
    const { project, setProject } = useBuilderStore();
    
    // Get UI state from the presentation-specific store
    const { activePresentationId } = usePresentationStore();

    const generationMutation = useGeneratePresentation();

    const translateMutation = useMutation({
        mutationFn: translatePresentationApi,
        onSuccess: (data) => {
            if (!project) return;
            // Update the presentation in the main project object
            project.presentation = { history: project.presentation?.history.map(p => p.id === data.id ? data : p) || [] };
            setProject(new Project(project.toStateObject()));
            
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
        generationMutation.mutate({ body, token });
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

    // The presentation to be displayed is derived from the project state and the active ID
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
