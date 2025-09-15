

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks';
import { useBuilderStore, useDocxStyles, useExport } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useGenerateProposal } from '@/hooks';
import { translateProposalApi, summarizeProjectApi } from '@/services';
import { ProjectProposalSchema, type ProjectProposal, type AnyProjectProposal } from '@/ai/schemas';
import { Project } from '@/lib/models/project';
import type { DocxTemplateKey } from '@/lib/docx-styles';
import { useIsMobile } from './use-mobile';

const DOCX_TEMPLATE_KEY = 'arkan-docx-template';

// Helper function to convert a proposal object to a markdown string
function proposalToMarkdown(proposal: AnyProjectProposal): string {
    let md = `# ${proposal.title}\n\n`;
    md += `**Category:** ${proposal.category}\n\n`;
    
    const renderValue = (value: any, level: number): string => {
        if (value === null || value === undefined) return '';
        if (typeof value !== 'object') return `${value}\n\n`;
        if (Array.isArray(value)) {
            return value.map(item => `- ${renderValue(item, level + 1)}`).join('');
        }
        return Object.entries(value).map(([k, v]) => {
            const keyTitle = k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
            return `${'#'.repeat(level)} ${keyTitle}\n\n${renderValue(v, level + 1)}`;
        }).join('');
    };

    for (const [key, value] of Object.entries(proposal)) {
        if (key !== 'title' && key !== 'category') {
            const keyTitle = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
            md += `## ${keyTitle}\n\n`;
            md += renderValue(value, 3);
        }
    }
    return md;
}


export function useProposalModeGeneratorLogic() {
    const { t, locale } = useLocalization();
    const { firebaseUser, refetchUser } = useAuth();
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

    const markdownContent = useMemo(() => {
        if (!proposal) return '';
        return proposalToMarkdown(proposal);
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

    // --- Logic from use-proposal-actions-logic ---
    const { templates: docxTemplates, isLoaded: docxLoaded } = useDocxStyles();
    const [selectedDocxTemplate, setSelectedDocxTemplate] = useState<DocxTemplateKey>('modern');
    const { exportProposal, isExporting } = useExport();

    const summarizeMutation = useMutation({
        mutationFn: summarizeProjectApi,
        onSuccess: () => refetchUser(),
        onError: (error: Error) => {
            toast({ title: "Summarization Failed", description: error.message, variant: "destructive" });
        }
    });

    useEffect(() => {
        const savedDocxTemplate = localStorage.getItem(DOCX_TEMPLATE_KEY) as DocxTemplateKey | null;
        if (savedDocxTemplate && docxTemplates && docxTemplates[savedDocxTemplate]) {
            setSelectedDocxTemplate(savedDocxTemplate);
        }
    }, [docxTemplates]);

    const handleDocxTemplateChange = (key: DocxTemplateKey) => {
        setSelectedDocxTemplate(key);
        localStorage.setItem(DOCX_TEMPLATE_KEY, key);
    }

    const handleExport = (format: 'docx' | 'pdf') => {
        if (project && project.proposal) {
            exportProposal(format, project, selectedDocxTemplate);
        }
    }

    const handleSummarizeProject = async () => {
        if (!project || !project.proposal || !firebaseUser) return;
        const reportMarkdown = Object.values(project.sections || {}).filter(Boolean).join('\n\n---\n\n');
        const token = await firebaseUser.getIdToken();
        summarizeMutation.mutate({ body: { proposal: project.proposal, reportMarkdown }, token });
    }
    // --- End of logic from use-proposal-actions-logic ---

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
        // from useProposalActionsLogic
        docxTemplates,
        docxLoaded,
        selectedDocxTemplate,
        isExporting,
        summarizeMutation,
        handleDocxTemplateChange,
        handleExport,
        handleSummarizeProject,
    };
}
