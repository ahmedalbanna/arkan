
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks';
import { useBuilderStore } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useGenerateProposal } from '@/hooks';
import { translateProposalApi } from '@/services';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';
import { useIsMobile } from '@/hooks/use-mobile';
import { EvaluationTools } from '@/components/evaluation/EvaluationTools';
import { ProposalGenerationTools } from '@/components/proposal-mode/ProposalGenerationTools';
import { Wand2, Scale } from 'lucide-react';

export function useProposalModeGeneratorLogic() {
    const { t, locale } = useLocalization();
    const { firebaseUser } = useAuth();
    const { project } = useBuilderStore();
    const generationMutation = useGenerateProposal();

    // Use a local state for the translated proposal to avoid overwriting the main state
    const [translatedProposal, setTranslatedProposal] = useState<ProjectProposal | null>(null);

    // The proposal to display is either the translated one or the original one from the store
    const proposal = translatedProposal || project?.proposal as ProjectProposal | null;

    const translateMutation = useMutation({
        mutationFn: translateProposalApi,
        onSuccess: (data: ProjectProposal) => {
            setTranslatedProposal(data); // Set the local state for the translated version
            toast({
                title: t('builder.proposalGenerator.toasts.translateAllSuccess'),
                description: t('builder.proposalGenerator.toasts.translateAllSuccessDesc'),
            });
        },
        onError: (error: Error) => {
            toast({
                title: t('builder.proposalGenerator.toasts.translateAllFailed'),
                description: error.message || t('builder.proposalGenerator.toasts.translateAllFailedDesc'),
                variant: 'destructive'
            });
        }
    });

    const handleTranslateProposal = async (targetLang: 'en' | 'ar') => {
        if (!project?.proposal || !firebaseUser) return;

        toast({
            title: t('builder.proposalGenerator.toasts.translateAllStarted'),
            description: t('builder.proposalGenerator.toasts.translateAllStartedDesc'),
        });

        const token = await firebaseUser.getIdToken();
        translateMutation.mutate({ proposal: project.proposal as ProjectProposal, targetLang, token });
    };

    const totalPages = useMemo(() => {
        if (!proposal) return 0;
        // Count keys in the Zod schema, excluding title and category which are on the cover.
        return Object.keys(ProjectProposalSchema.shape).filter(k => k !== 'title' && k !== 'category').length + 1;
    }, [proposal]);


    const [currentPage, setCurrentPage] = useState(0);
    const [zoom, setZoom] = useState(1);
    const isMobile = useIsMobile();

    useEffect(() => {
        setCurrentPage(0);
        setTranslatedProposal(null); // Reset translation when original proposal changes
    }, [project?.proposal]);

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const isBusy = generationMutation.isPending || translateMutation.isPending;

    const toolPanels = useMemo(() => [
        {
            key: 'generator',
            title: t('builder.proposalGenerator.tools.title'),
            icon: React.createElement(Wand2, { className: "h-5 w-5" }),
            content: React.createElement(ProposalGenerationTools, { isDisabled: isBusy })
        },
        {
            key: 'evaluator',
            title: t('builder.evaluation.title'),
            icon: React.createElement(Scale, { className: "h-5 w-5" }),
            content: React.createElement(EvaluationTools)
        }
    ], [t, isBusy]);

    return {
        t,
        locale,
        isBusy,
        proposal,
        generationMutation,
        translateMutation,
        handleTranslateProposal,
        totalPages,
        currentPage,
        zoom,
        setZoom,
        isMobile,
        handleNextPage,
        handlePrevPage,
        toolPanels,
    };
}
