'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useGenerateProposal } from '@/hooks/use-proposal-generation';
import { translateProposalApi } from '@/services/translation-service';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';
import { useIsMobile } from '@/hooks/use-mobile';
import { EvaluationTools } from '@/components/evaluation/EvaluationTools';
import { ProposalGenerationTools } from '@/components/proposal-mode/ProposalGenerationTools';
import { Wand2, Scale } from 'lucide-react';

export function useProposalModeGeneratorLogic() {
    const { t, locale } = useLocalization();
    const { firebaseUser } = useAuth();
    const { proposal, setProposal } = useBuilderStore();
    const generationMutation = useGenerateProposal();

    const translateMutation = useMutation({
        mutationFn: translateProposalApi,
        onSuccess: (data: ProjectProposal) => {
            setProposal(data);
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
        if (!proposal || !firebaseUser) return;

        toast({
            title: t('builder.proposalGenerator.toasts.translateAllStarted'),
            description: t('builder.proposalGenerator.toasts.translateAllStartedDesc'),
        });

        const token = await firebaseUser.getIdToken();
        translateMutation.mutate({ proposal: proposal as ProjectProposal, targetLang, token });
    };

    const parsedProposalObject = proposal as ProjectProposal | null;

    const orderedKeys = useMemo(() =>
        parsedProposalObject ? Object.keys(ProjectProposalSchema.shape).filter(k => k !== 'title' && k !== 'category') : [],
        [parsedProposalObject]
    );

    const totalPages = orderedKeys.length > 0 ? orderedKeys.length + 1 : 0;

    const [currentPage, setCurrentPage] = useState(0);
    const [zoom, setZoom] = useState(1);
    const isMobile = useIsMobile();

    useEffect(() => {
        setCurrentPage(0);
    }, [proposal]);

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
        proposal: parsedProposalObject,
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
