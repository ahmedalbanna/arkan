
'use client';

import { exportProposalAsPdf as exportProposalPdfUtil, exportProposalAsDocx as exportProposalUtil, exportReportAsDocx as exportReportUtil } from '@/lib/docx-exporter';
import { exportPresentationAsPptx as exportPptxUtil } from '@/lib/pptx-exporter';
import { useState } from 'react';
import { toast } from './use-toast';

import { Project } from '@/lib/models/project';
import { SectionName } from '@/ai/schemas';

export function useExport() {
    const [isExporting, setIsExporting] = useState(false);

    const exportProposal = async (format: 'docx' | 'pdf', project: Project) => {
        setIsExporting(true);
        try {
            const proposalData = project.proposal?.toJSON();
            if (!proposalData) {
                toast({ title: 'Export Failed', description: 'No proposal data found.', variant: 'destructive' });
                return;
            }
            if (format === 'docx') {
                await exportProposalUtil(proposalData);
            } else {
                await exportProposalPdfUtil(proposalData);
            }
            toast({ title: 'Export Successful', description: `Proposal exported as ${format.toUpperCase()}.` });
        } catch (error) {
            console.error(error);
            toast({ title: 'Export Failed', description: `Could not generate the ${format.toUpperCase()} file.`, variant: 'destructive' });
        } finally {
            setIsExporting(false);
        }
    };

    const exportReportDocx = async (project: Project, translatedTitles: { [key in string]?: string; }, sectionsToIncludeKeys?: SectionName[]) => {
        setIsExporting(true);
        try {
            const allSections = project.sections.toJSON();
            const allDiagrams = project.diagrams.toJSON();
            const reportName = project.name || 'Untitled Report';

            const sectionsToExport = sectionsToIncludeKeys?.reduce((acc, key) => {
                if (allSections[key]) {
                    acc[key] = allSections[key];
                }
                return acc;
            }, {} as { [key in SectionName]?: string }) || allSections;

            await exportReportUtil(sectionsToExport, allDiagrams, reportName, translatedTitles, sectionsToIncludeKeys);
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
            const presentationState = project.presentation?.toJSON();
            const activePresentation = presentationState?.history.find(p => p.id === activePresentationId);
            
            if (!activePresentation?.slides) {
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
