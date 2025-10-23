
'use client';

import { type ProjectProposalData, ProjectProposal } from '@/lib/models/project-proposal';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { toast, useBuilderStore, useExport } from '@/hooks';
import { useGenerateProposal } from './use-proposal-generation';
import { summarizeProjectApi, translateProposalApi } from '@/services';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useIsMobile } from './use-mobile';

export function useProposalModeGeneratorLogic() {
    const { t, locale } = useLocalization();
    const { firebaseUser, refetchUser } = useAuth();
    const { project, updateProject } = useBuilderStore();
    const generationMutation = useGenerateProposal();

    const [translatedProposal, setTranslatedProposal] = useState<ProjectProposal | null>(null);
    const proposal = translatedProposal || project?.proposal;

    const translateMutation = useMutation({
        mutationFn: async (variables: { proposal: ProjectProposal, targetLang: 'en' | 'ar', token: string }) => {
            const result = await translateProposalApi({
                ...variables,
                proposal: variables.proposal.toJSON() as any,
            });
            return result as ProjectProposalData;
        },
        onSuccess: (data) => {
            setTranslatedProposal(new ProjectProposal(data));
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
        translateMutation.mutate({ proposal: project.proposal, targetLang, token });
    };

    const markdownContent = useMemo(() => {
        if (!proposal) return '';
        return proposal.toMarkdown();
    }, [proposal]);

    useEffect(() => {
        setCurrentPage(0);
        setTranslatedProposal(null);
    }, [project?.proposal]);
    
    const handleProposalUpdate = (key: string, value: string) => {
        updateProject(p => {
            p.proposal?.updateSection(key, value);
            p.setUnsavedChanges(true);
        });
    }

    const totalPages = useMemo(() => {
        if (!proposal?.sections) return 1;
        return Object.keys(proposal.sections).length + 1;
    }, [proposal]);

    const [currentPage, setCurrentPage] = useState(0);
    const [zoom, setZoom] = useState(1);
    const isMobile = useIsMobile();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

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

    const { exportProposal, isExporting } = useExport();

    const summarizeMutation = useMutation({
        mutationFn: async (variables: { body: any, token: string }) => {
            const response = await summarizeProjectApi(variables);
            return response;
        },
        onSuccess: () => refetchUser(),
        onError: (error: Error) => {
            toast({ title: "Summarization Failed", description: error.message, variant: "destructive" });
        }
    });

    const handleExport = (format: 'docx' | 'pdf') => {
        if (project && project.proposal) {
            exportProposal(format, project);
        }
    }

    const handleSummarizeProject = async () => {
        if (!project || !project.proposal || !firebaseUser) return;
        // CORRECTED: Access the section manager from the report object
        const reportMarkdown = project.report.sectionsManager.toMarkdown();
        const token = await firebaseUser.getIdToken();
        summarizeMutation.mutate({ body: { proposal: project.proposal.toJSON(), reportMarkdown }, token });
    }

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
        markdownContent,
        handleProposalUpdate,
        isExporting,
        summarizeMutation,
        handleExport,
        handleSummarizeProject,
    };
}
