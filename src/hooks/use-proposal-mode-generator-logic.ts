
'use client';

import { ProjectProposalSchema, type AnyProjectProposal, type ProjectProposal } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { toast, useBuilderStore, useExport, useGenerateProposal } from '@/hooks';
import { formatKeyToTitle } from '@/lib/proposal-utils';
import { summarizeProjectApi, translateProposalApi, writingToolApi } from '@/services';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useIsMobile } from './use-mobile';
import { useWritingTool } from './use-writing-tools';
import { set } from 'date-fns';

// Helper function to convert a proposal object to a markdown string
function proposalToMarkdown(proposal: AnyProjectProposal): string {
    // Helper to recursively render any value to a markdown string
    const renderValue = (value: any): string => {
        if (value === null || value === undefined) {
            return "";
        }

        // If value is a string, try to parse it as JSON first.
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                // If parsing is successful and it's an object, recurse.
                if (typeof parsed === 'object' && parsed !== null) {
                    return renderValue(parsed);
                }
            } catch (e) {
                // Not a JSON string, treat as regular text.
            }
            return value; // Return the plain string
        }

        if (Array.isArray(value)) {
            // For each item in the array, render it as a list item.
            return value
                .map(item => `- ${renderValue(item)}`)
                .join('\n');
        }

        if (typeof value === 'object') {
            // For each key-value pair in the object, render it as a sub-section.
            return Object.entries(value)
                .map(([k, v]) => {
                    const keyTitle = formatKeyToTitle(k);
                    const nestedValue = renderValue(v);
                    // Render simple key-value pairs on one line, complex ones on multiple.
                    if (typeof v === 'object' || (typeof v === 'string' && v.includes('\n')) ){
                         return `**${keyTitle}:**\n${nestedValue}`;
                    }
                    return `**${keyTitle}:** ${nestedValue}`;
                })
                .join('\n'); // Use single newline for object properties for a denser look
        }

        return String(value);
    };

    let md = `# ${proposal.title || 'Untitled Proposal'}\n\n`;
    if (proposal.category && proposal.category !== 'undefined') {
        md += `**Category:** ${proposal.category}\n\n`;
    }

    // Get all other keys and render them as top-level sections
    Object.entries(proposal)
        .filter(([key]) => key !== 'title' && key !== 'category')
        .forEach(([key, value]) => {
            const keyTitle = formatKeyToTitle(key);
            md += `## ${keyTitle}\n\n`;
            md += renderValue(value);
            md += '\n\n'; // Add space between sections
        });

    return md.trim();
}


export function useProposalModeGeneratorLogic() {
    const { t, locale } = useLocalization();
    const { firebaseUser, refetchUser } = useAuth();
    const { project, updateProject } = useBuilderStore();
    const generationMutation = useGenerateProposal();

    const [translatedProposal, setTranslatedProposal] = useState<ProjectProposal | null>(null);

    const proposal = translatedProposal || project?.proposal as ProjectProposal | null;

    const translateMutation = useMutation({
        mutationFn: async (variables: { proposal: ProjectProposal, targetLang: 'en' | 'ar', token: string }) => {
            const result = await translateProposalApi(variables);
            return result as ProjectProposal;
        },
        onSuccess: (data) => {
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
        return Object.keys(proposal).filter(k => k !== 'title' && k !== 'category').length + 1;
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

    const handleProposalUpdate = (key: string, value: string) => {
        updateProject(p => {
            if (p.proposal) {
                p.proposal[key as keyof typeof p.proposal] = value;
            }
        });
    }

    // --- Logic from use-proposal-actions-logic ---
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
        handleProposalUpdate,
        // from useProposalActionsLogic
        isExporting,
        summarizeMutation,
        handleExport,
        handleSummarizeProject,
    };
}
