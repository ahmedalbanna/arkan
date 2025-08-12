
'use client';

import { useState } from 'react';
import { toast } from './use-toast';
import { exportProposalAsDocx as exportProposalUtil, exportProposalAsPdf as exportProposalPdfUtil, exportReportAsDocx as exportReportUtil } from '@/lib/docx-exporter';
import { exportPresentationAsPptx as exportPptxUtil } from '@/lib/pptx-exporter';

import type { SavedProject } from '@/lib/types';
import type { ProjectProposal, DiagramType, SectionName, PresentationSlide } from '@/ai/schemas';
import { TemplateKey } from '@/lib/docx-styles';
import { PptxTemplateKey } from '@/lib/pptx-styles';


export function useExport() {
    const [isExporting, setIsExporting] = useState(false);

    const exportProposal = async (format: 'docx' | 'pdf', proposal: ProjectProposal, templateKey: TemplateKey) => {
        setIsExporting(true);
        try {
            if (format === 'docx') {
                await exportProposalUtil(proposal, templateKey);
            } else {
                await exportProposalPdfUtil(proposal, templateKey);
            }
        } catch (error) {
            console.error(error);
            toast({ title: 'Export Failed', description: `Could not generate the ${format.toUpperCase()} file.`, variant: 'destructive' });
        } finally {
            setIsExporting(false);
        }
    };

    const exportReportDocx = async (
        sections: { [key in SectionName]?: string; },
        diagrams: { [key in DiagramType]?: { plantUmlCode: string; imageUrl: string; } },
        proposalTitle: string,
        templateKey: TemplateKey,
        translatedTitles: { [key in SectionName]?: string; },
        sectionsToInclude?: SectionName[]
    ) => {
        setIsExporting(true);
        try {
            await exportReportUtil(sections, diagrams, proposalTitle, templateKey, translatedTitles, sectionsToInclude);
        } catch (error) {
            console.error(error);
            toast({ title: 'Export Failed', description: 'Could not generate the DOCX file.', variant: 'destructive' });
        } finally {
            setIsExporting(false);
        }
    };

    const exportPresentationPptx = async (slides: PresentationSlide[], templateKey: PptxTemplateKey) => {
        setIsExporting(true);
        try {
            await exportPptxUtil(slides, templateKey);
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
