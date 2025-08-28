'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useBuilderStore } from '@/hooks';
import { useReportStore } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useDocxStyles } from '@/hooks';
import { useExport } from '@/hooks';
import { toast } from '@/hooks';
import { summarizeProjectApi } from '@/services';
import type { TemplateKey } from '@/lib/docx-styles';
import { useLocalization } from '@/context/LocalizationContext';

const DOCX_TEMPLATE_KEY = 'arkan-docx-template';

export function useProposalActionsLogic() {
    const { t } = useLocalization();
    const { proposal } = useBuilderStore();
    const { sections } = useReportStore();
    const { templates: docxTemplates, isLoaded: docxLoaded } = useDocxStyles();
    const [selectedDocxTemplate, setSelectedDocxTemplate] = useState<TemplateKey>('modern');
    const { firebaseUser, refetchUser } = useAuth();
    const { exportProposal, isExporting } = useExport();

    const summarizeMutation = useMutation({
        mutationFn: summarizeProjectApi,
        onSuccess: () => {
            refetchUser();
        },
        onError: (error: Error) => {
            toast({ title: "Summarization Failed", description: error.message, variant: "destructive" });
        }
    });

    useEffect(() => {
        const savedDocxTemplate = localStorage.getItem(DOCX_TEMPLATE_KEY) as TemplateKey | null;
        if (savedDocxTemplate && docxTemplates && docxTemplates[savedDocxTemplate]) {
            setSelectedDocxTemplate(savedDocxTemplate);
        }
    }, [docxTemplates]);

    const handleDocxTemplateChange = (key: TemplateKey) => {
        setSelectedDocxTemplate(key);
        localStorage.setItem(DOCX_TEMPLATE_KEY, key);
    }

    const handleExport = (format: 'docx' | 'pdf') => {
        if (proposal) {
            exportProposal(format, proposal as any, selectedDocxTemplate);
        }
    }

    const handleSummarizeProject = async () => {
        if (!proposal || !firebaseUser) return;
        const reportMarkdown = Object.values(sections).filter(Boolean).join('\n\n---\n\n');
        const token = await firebaseUser.getIdToken();
        summarizeMutation.mutate({ body: { proposal, reportMarkdown }, token });
    }

    return {
        t,
        proposal,
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
