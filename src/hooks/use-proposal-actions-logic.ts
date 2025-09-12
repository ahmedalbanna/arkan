
'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useBuilderStore, useReportStore, useDocxStyles, useExport, useToast } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { summarizeProjectApi } from '@/services';
import type { DocxTemplateKey } from '@/lib/docx-styles';
import { useLocalization } from '@/context/LocalizationContext';

const DOCX_TEMPLATE_KEY = 'arkan-docx-template';

export function useProposalActionsLogic() {
    const { t } = useLocalization();
    const { project } = useBuilderStore(); // Get project instance
    const { toast } = useToast();
    const { templates: docxTemplates, isLoaded: docxLoaded } = useDocxStyles();
    const [selectedDocxTemplate, setSelectedDocxTemplate] = useState<DocxTemplateKey>('modern');
    const { firebaseUser, refetchUser } = useAuth();
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

    return {
        t,
        project,
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
