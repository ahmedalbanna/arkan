
'use client';

import { useState } from 'react';
import { toast } from './use-toast';
import { exportProposalAsDocx as exportProposalUtil, exportProposalAsPdf as exportProposalPdfUtil, exportReportAsDocx as exportReportUtil } from '@/lib/docx-exporter';
import { exportPresentationAsPptx as exportPptxUtil } from '@/lib/pptx-exporter';

import { Project } from '@/lib/models/project'; 
import type { DocxTemplateKey, PptxTemplateKey } from '@/lib/types';


export function useExport() {
    const [isExporting, setIsExporting] = useState(false);

    const exportProposal = async (format: 'docx' | 'pdf', project: Project, docxTemplateKey: DocxTemplateKey ) => {
        setIsExporting(true);
        try {
            if (!project.proposal) {
                toast({ title: 'Export Failed', description: 'No proposal data found.', variant: 'destructive' });
                return;
            }
            if (format === 'docx') {
                await exportProposalUtil(project.proposal, docxTemplateKey );
            } else {
                await exportProposalPdfUtil(project.proposal, docxTemplateKey );
            }
            toast({ title: 'Export Successful', description: `Proposal exported as ${format.toUpperCase()}.` });
        } catch (error) {
            console.error(error);
            toast({ title: 'Export Failed', description: `Could not generate the ${format.toUpperCase()} file.`, variant: 'destructive' });
        } finally {
            setIsExporting(false);
        }
    };

    const exportReportDocx = async (project: Project, docxTemplateKey: DocxTemplateKey, translatedTitles: { [key in string]?: string; }, sectionsToInclude?: string[] ) => {
        setIsExporting(true);
        try {
            const sectionsToExport = sectionsToInclude?.reduce((acc, key) => {
                const content = project.getSectionContent(key as any);
                if (content) {
                    acc[key as any] = content;
                }
                return acc;
            }, {} as { [key in string]?: string }) || project.sections;
            
            await exportReportUtil(sectionsToExport || {}, project.diagrams || {}, project.name || 'Untitled Report', docxTemplateKey, translatedTitles, sectionsToInclude);
            toast({ title: 'Export Successful', description: 'Report exported as DOCX.' });
        } catch (error) {
            console.error(error);
            toast({ title: 'Export Failed', description: 'Could not generate the DOCX file.', variant: 'destructive' });
        } finally {
            setIsExporting(false);
        }
    };

    const exportPresentationPptx = async (project: Project, pptxTemplateKey: PptxTemplateKey) => {
        setIsExporting(true);
        try {
            const activePresentation = project.presentation?.history[0]; // Assuming the first one is the active/latest
            if (!activePresentation || !activePresentation.slides) {
                toast({ title: 'Export Failed', description: 'No presentation slides found.', variant: 'destructive' });
                return;
            }
            await exportPptxUtil(activePresentation.slides, pptxTemplateKey);
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
