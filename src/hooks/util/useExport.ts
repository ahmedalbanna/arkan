

'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import { toast } from './use-toast';
import type { Section } from '@/lib/models';
import { templates as docxTemplates, type DocxTemplateKey } from '@/lib/docx-styles';
import { templates as pptxTemplates, type PptxTemplateKey } from '@/lib/pptx-styles';
import { ConversionOptions } from '@/lib/word-converter/types';
import { convertMarkdownToPptx, PptxConversionOptions } from '@/lib/markdown-to-pptx-converter';

interface DocxExportParams {
    sections: Section[];
    projectName: string;
    options: {
        template: DocxTemplateKey;
        pageNumbers: boolean;
    };
}

interface PptxExportParams {
    sections: Section[];
    projectName: string;
    options: {
        template: PptxTemplateKey;
        isRtl: boolean;
        includeToc: boolean;
    }
}


export function useExport() {
    const [isExporting, setIsExporting] = useState(false);

    /**
     * Exports a report as a DOCX file by calling the server-side API.
     * @param params - An object containing the sections, project name, and export options.
     */
    const exportReportDocx = async ({ sections, projectName, options }: DocxExportParams) => {
        if (!sections || sections.length === 0) {
            toast({ title: 'Export Canceled', description: 'No content selected to export.', variant: 'destructive' });
            return;
        }
        setIsExporting(true);
        try {
            const fullMarkdown = sections
                .map(section => `# ${section.title}\n\n${section.content || ''}`)
                .join('\n\n---\n\n');

            const templateStyles = docxTemplates[options.template] || docxTemplates.modern;
            
            const apiOptions: ConversionOptions = {
                styles: templateStyles.styles,
                customStyles: templateStyles.customStyles,
                pageNumbers: options.pageNumbers,
                isRtl: false, // This could be another option in the UI
            };

            const response = await fetch('/api/export/docx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    markdown: fullMarkdown,
                    fileName: projectName.replace(/\s+/g, '_'),
                    options: apiOptions,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to generate DOCX file on the server.');
            }

            const blob = await response.blob();
            saveAs(blob, `${projectName.replace(/\s+/g, '_')}_report.docx`);

            toast({ title: 'Export Successful', description: 'Report exported as DOCX.' });
        } catch (error) {
            console.error(error);
            toast({ title: 'Export Failed', description: 'Could not generate the DOCX file.', variant: 'destructive' });
        } finally {
            setIsExporting(false);
        }
    };
    
    /**
     * Exports a report as a PPTX file.
     * @param params - An object containing the sections, project name, and export options.
     */
    const exportPresentationPptx = async ({ sections, projectName, options }: PptxExportParams) => {
        if (!sections || sections.length === 0) {
            toast({ title: 'Export Canceled', description: 'No content selected to export.', variant: 'destructive' });
            return;
        }
        setIsExporting(true);
        try {
            const fullMarkdown = sections
                .map(section => `# ${section.title}\n\n${section.content || ''}`)
                .join('\n\n---\n\n');

            const templateStyles = pptxTemplates[options.template] || pptxTemplates.modern;

            const conversionOptions: PptxConversionOptions = {
                styles: templateStyles.styles,
                isRtl: options.isRtl,
                includeToc: options.includeToc,
            };

            await convertMarkdownToPptx(
                fullMarkdown,
                projectName.replace(/\s+/g, '_'),
                conversionOptions
            );

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
