
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
import { Project } from '@/lib/models/project';

export function useProposalModeGeneratorLogic() {
    const { t, locale } = useLocalization();
    const { firebaseUser } = useAuth();
    const { project, setProject } = useBuilderStore();
    const generationMutation = useGenerateProposal();

    const [translatedProposal, setTranslatedProposal] = useState<ProjectProposal | null>(null);

    const proposal = translatedProposal || project?.proposal as ProjectProposal | null;

    const translateMutation = useMutation({
        mutationFn: translateProposalApi,
        onSuccess: (data: ProjectProposal) => {
            setTranslatedProposal(data);
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
        return Object.keys(ProjectProposalSchema.shape).filter(k => k !== 'title' && k !== 'category').length + 1;
    }, [proposal]);

    const [currentPage, setCurrentPage] = useState(0);
    const [zoom, setZoom] = useState(1);
    const isMobile = useIsMobile();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

    useEffect(() => {
        setCurrentPage(0);
        setTranslatedProposal(null);
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

    return {
        t,
        locale,
        isPanelCollapsed,
        setIsPanelCollapsed,
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
    };
}
