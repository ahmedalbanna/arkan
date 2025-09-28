

'use client';

import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { createPresentationToolHook } from '@/core';
import { toast, useGeneratePresentation } from '@/hooks';
import { translatePresentationApi } from '@/services';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { useBuilderStore } from './useBuilderStore';
import { useGenerationUIStore } from './useGenerationUIStore';

export function usePresentationGeneratorLogic() {
    const { t, locale } = useLocalization();
    const { firebaseUser } = useAuth();
    const { project, updateProject } = useBuilderStore();

    const { activePresentationId } = useGenerationUIStore();

    const generationMutation = useGeneratePresentation();

    // استخدام النظام الجديد من src/core
    const presentationTool = createPresentationToolHook({
        toolName: 'presentation-generator',
        apiEndpoint: '/api/presentations/generate',
        schema: z.object({
            title: z.string().min(5),
            topic: z.string().min(10),
            audience: z.string().optional(),
            duration: z.number().min(5).max(120),
            slides: z.array(z.string()).optional()
        }),
        defaultValues: { title: '', topic: '', audience: '', duration: 30, slides: [] },
        presentationType: 'slides',
        successMessage: t('presentationGenerator.success') || 'Presentation generated successfully!',
        errorMessage: t('presentationGenerator.error') || 'Failed to generate presentation',
        customFeatures: {
            formatOutput: (data: any) => {
                return {
                    title: data.title || 'Untitled Presentation',
                    slides: data.slides || [],
                    metadata: {
                        slideCount: data.slides?.length || 0,
                        estimatedDuration: data.estimatedDuration || 30,
                        targetAudience: data.targetAudience || 'General',
                        difficulty: data.difficulty || 'medium'
                    }
                };
            },
            validateInput: (data: any) => {
                return data.title && data.topic && data.title.length > 0 && data.topic.length > 0;
            },
            getPresentationSections: () => ['Introduction', 'Main Content', 'Examples', 'Conclusion', 'Q&A'],
            getSlideCount: (data: any) => data.slides?.length || 0,
            getEstimatedDuration: (data: any) => data.estimatedDuration || 30
        }
    })();

    const translateMutation = useMutation({
        mutationFn: translatePresentationApi,
        onSuccess: (data) => {
            if (!project) return;
            // Create a new Project instance with the updated history
            const newHistory = (project.presentation?.history || []).map(p =>
                p.id === data.id ? data : p
            );
            const newState = { ...project.toJSON(), presentation: { history: newHistory } };
            updateProject(p => Object.assign(p, newState));


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

    const activePresentation = project?.presentation?.history.find(p => p.id === activePresentationId);

    return {
        t,
        locale,
        generationMutation,
        translateMutation,
        onGenerate,
        handleTranslateAll,
        activePresentation,

        // النظام الجديد من src/core
        presentationTool,
        isProcessing: presentationTool.isProcessing,
        processedText: presentationTool.processedText,
        generatedPresentation: presentationTool.generatedPresentation,
        isCopied: presentationTool.isCopied,
        handleCopy: presentationTool.copyToClipboard,
        onSubmit: presentationTool.onSubmit,
        reset: presentationTool.reset,
        getPresentationSections: presentationTool.getPresentationSections,
        getSlideCount: presentationTool.getSlideCount,
        getEstimatedDuration: presentationTool.getEstimatedDuration,
    };
}

