'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { usePresentationStore } from '@/hooks/usePresentationStore';
import { useGeneratePresentation } from '@/hooks/use-presentation-generation';
import { translatePresentationApi } from '@/services/translation-service';
import { toast } from '@/hooks/use-toast';

export function usePresentationGeneratorLogic() {
    const { t, locale } = useLocalization();
    const { firebaseUser } = useAuth();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const {
        presentation,
        activePresentationId,
        replacePresentationInHistory
    } = usePresentationStore();

    const generationMutation = useGeneratePresentation();

    const translateMutation = useMutation({
        mutationFn: translatePresentationApi,
        onSuccess: (data) => {
            replacePresentationInHistory(data);
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
        const activePresentation = presentation?.history.find(p => p.id === activePresentationId);
        if (!activePresentation || !firebaseUser) return;

        toast({
            title: t('builder.presentationGenerator.toasts.translateAllStarted'),
            description: t('builder.presentationGenerator.toasts.translateAllStartedDesc'),
        });

        const token = await firebaseUser.getIdToken();
        translateMutation.mutate({ presentation: activePresentation, targetLang, token });
    };

    const activePresentation = presentation?.history.find(p => p.id === activePresentationId);

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
