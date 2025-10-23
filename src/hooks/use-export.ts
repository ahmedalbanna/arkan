

'use client';

import { exportProposalAsPdf as exportProposalPdfUtil, exportProposalAsDocx as exportProposalUtil, exportReportAsDocx as exportReportUtil } from '@/lib/docx-exporter';
import { exportPresentationAsPptx as exportPptxUtil } from '@/lib/pptx-exporter';
import { useState } from 'react';
import { toast } from './use-toast';

import type { ProjectProposal } from '@/ai/schemas';
import { Project } from '@/lib/models/project';

export function useExport() {
    const [isExporting, setIsExporting] = useState(false);

    const exportProposal = async (format: 'docx' | 'pdf', project: Project) => {
        setIsExporting(true);
        try {
            if (!project.proposal) {
                toast({ title: 'Export Failed', description: 'No proposal data found.', variant: 'destructive' });
                return;
            }
            if (format === 'docx') {
                await exportProposalUtil(project.proposal as ProjectProposal);
            } else {
                await exportProposalPdfUtil(project.proposal as ProjectProposal);
            }
            toast({ title: 'Export Successful', description: `Proposal exported as ${format.toUpperCase()}.` });
        } catch (error) {
            console.error(error);
            toast({ title: 'Export Failed', description: `Could not generate the ${format.toUpperCase()} file.`, variant: 'destructive' });
        } finally {
            setIsExporting(false);
        }
    };

    const exportReportDocx = async (project: Project, translatedTitles: { [key in string]?: string; }, sectionsToInclude?: string[]) => {
        setIsExporting(true);
        try {
            const sectionsToExport = sectionsToInclude?.reduce((acc, key) => {
                const content = project.getSectionContent(key as any);
                if (content) {
                    acc[key as any] = content;
                }
                return acc;
            }, {} as { [key in string]?: string }) || project.sections;

            await exportReportUtil(sectionsToExport || {}, project.diagrams || {}, project.name || 'Untitled Report', translatedTitles, sectionsToInclude);
            toast({ title: 'Export Successful', description: 'Report exported as DOCX.' });
        } catch (error) {
            console.error(error);
            toast({ title: 'Export Failed', description: 'Could not generate the DOCX file.', variant: 'destructive' });
        } finally {
            setIsExporting(false);
        }
    };

    const exportPresentationPptx = async (project: Project, activePresentationId: string | null) => {
        setIsExporting(true);
        try {
            const activePresentation = project.presentation?.history.find(p => p.id === activePresentationId);
            if (!activePresentation || !activePresentation.slides) {
                toast({ title: 'Export Failed', description: 'No presentation slides found to export.', variant: 'destructive' });
                return;
            }
            await exportPptxUtil(activePresentation.slides);
            toast({ title: 'Export Successful', description: 'Presentation exported as PPTX.' });
        } catch (error) {
            console.error(error);
            toast({ title: 'Export Failed', description: 'Could not generate the PPTX file.', variant: 'destructive' });
        } finally {
            setIsExporting(false);
        }
    }


    return {
        isExporting,
        exportProposal,
        exportReportDocx,
        exportPresentationPptx,
    };
}
