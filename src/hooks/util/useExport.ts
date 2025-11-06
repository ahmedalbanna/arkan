
'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import { toast } from './use-toast';
import type { Project, Section } from '@/lib/models';
import { templates, type DocxTemplateKey } from '@/lib/docx-styles'; // Assuming default styles are needed for options
import { ConversionOptions } from '@/lib/word-converter/types';

interface ExportParams {
    sections: Section[];
    projectName: string;
    options: {
        template: DocxTemplateKey;
        pageNumbers: boolean;
    };
}


export function useExport() {
    const [isExporting, setIsExporting] = useState(false);

    /**
     * Exports a report as a DOCX file by calling the server-side API.
     * @param params - An object containing the sections, project name, and export options.
     */
    const exportReportDocx = async ({ sections, projectName, options }: ExportParams) => {
        if (!sections || sections.length === 0) {
            toast({ title: 'Export Canceled', description: 'No content selected to export.', variant: 'destructive' });
            return;
        }
        setIsExporting(true);
        try {
            const fullMarkdown = sections
                .map(section => `# ${section.title}\n\n${section.content || ''}`)
                .join('\n\n---\n\n');

            const templateStyles = templates[options.template] || templates.modern;
            
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

    return {
        isExporting,
        exportReportDocx,
    };
}
