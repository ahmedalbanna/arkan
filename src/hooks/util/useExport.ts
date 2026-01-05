
'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import { toast } from './use-toast';
import type { Project } from '@/lib/models';
import { templates as docxTemplates, type DocxTemplateKey } from '@/lib/docx-styles';
import { templates as pptxTemplates, type PptxTemplateKey } from '@/lib/pptx-styles';
import { PptxConversionOptions, convertMarkdownToPptx } from '@/lib/markdown-to-pptx-converter';
import { convertMarkdownToWord } from '@/lib/markdown-to-word-converter';
import { ConversionOptions } from '@/lib/word-converter/types';

interface DocxExportParams {
    project: Project;
    options: {
        template: DocxTemplateKey;
        pageNumbers: boolean;
    };
}

interface PptxExportParams {
    project: Project;
    options: {
        template: PptxTemplateKey;
        isRtl: boolean;
        includeToc: boolean;
    }
}

export function useExport() {
    const [isExporting, setIsExporting] = useState(false);

    /**
     * Exports a report as a DOCX file by generating it on the client-side.
     * @param params - An object containing the project and export options.
     */
    const exportReportDocx = async ({ project, options }: DocxExportParams) => {
        if (!project.hasContent()) {
            toast({ title: 'Export Canceled', description: 'No content available to export.', variant: 'destructive' });
            return;
        }
        setIsExporting(true);
        try {
            const templateStyles = docxTemplates[options.template] || docxTemplates.modern;
            
            const conversionOptions: ConversionOptions = {
                styles: templateStyles.styles,
                customStyles: templateStyles.customStyles,
                pageNumbers: options.pageNumbers,
                isRtl: false,
            };

            const blob = await convertMarkdownToWord(project.fullMarkdownContent, project.name, conversionOptions);
            saveAs(blob, `${project.name.replace(/\s+/g, '_')}_report.docx`);

            toast({ title: 'Export Successful', description: 'Report exported as DOCX.' });
        } catch (error) {
            console.error(error);
            toast({ title: 'Export Failed', description: 'Could not generate the DOCX file.', variant: 'destructive' });
        } finally {
            setIsExporting(false);
        }
    };
    
    /**
     * Exports a report as a PPTX file by generating it on the client side.
     * @param params - An object containing the project and export options.
     */
    const exportPresentationPptx = async ({ project, options }: PptxExportParams) => {
        if (!project.hasContent()) {
            toast({ title: 'Export Canceled', description: 'No content available to export.', variant: 'destructive' });
            return;
        }
        setIsExporting(true);
        try {
            const templateStyles = pptxTemplates[options.template] || pptxTemplates.modern;

            const conversionOptions: PptxConversionOptions = {
                styles: templateStyles.styles,
                isRtl: options.isRtl,
                includeToc: options.includeToc,
            };

            const blob = await convertMarkdownToPptx(project.fullMarkdownContent, project.name, conversionOptions);
            saveAs(blob, `${project.name.replace(/\s+/g, '_')}_presentation.pptx`);

            toast({ title: 'Export Successful', description: 'Presentation exported as PPTX.' });
        } catch (error) {
            console.error(error);
            toast({ title: 'Export Failed', description: 'Could not generate the PPTX file.', variant: 'destructive' });
        } finally {
            setIsExporting(false);
        }
    };

    return {
        isExporting,
        exportReportDocx,
        exportPresentationPptx,
    };
}
