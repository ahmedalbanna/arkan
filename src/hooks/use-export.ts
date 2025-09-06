
'use client';

import { useState } from 'react';
import { toast } from './use-toast';
import { exportProposalAsDocx as exportProposalUtil, exportProposalAsPdf as exportProposalPdfUtil, exportReportAsDocx as exportReportUtil } from '@/lib/docx-exporter';
import { exportPresentationAsPptx as exportPptxUtil } from '@/lib/pptx-exporter';

import type { SavedProject } from '@/lib/types';
import type { ProjectProposal, DiagramType, SectionName, PresentationSlide } from '@/ai/schemas';
import { DocxTemplateKey  } from '@/lib/docx-styles';
import { PptxTemplateKey } from '@/lib/pptx-styles';



export function useExport() {
    const [isExporting, setIsExporting] = useState(false);

    const exportProposal = async (format: 'docx' | 'pdf', proposal: ProjectProposal, DocxTemplateKey : DocxTemplateKey ) => {
        setIsExporting(true);
        try {
            if (format === 'docx') {
                await exportProposalUtil(proposal, DocxTemplateKey );
            } else {
                await exportProposalPdfUtil(proposal, DocxTemplateKey );
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
        DocxTemplateKey : DocxTemplateKey ,
        translatedTitles: { [key in SectionName]?: string; },
        sectionsToInclude?: SectionName[]
    ) => {
        setIsExporting(true);
        try {
            await exportReportUtil(sections, diagrams, proposalTitle, DocxTemplateKey , translatedTitles, sectionsToInclude);
        } catch (error) {
            console.error(error);
            toast({ title: 'Export Failed', description: 'Could not generate the DOCX file.', variant: 'destructive' });
        } finally {
            setIsExporting(false);
        }
    };

    const exportPresentationPptx = async (slides: PresentationSlide[], DocxTemplateKey : PptxTemplateKey) => {
        setIsExporting(true);
        try {
            await exportPptxUtil(slides, DocxTemplateKey );
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
