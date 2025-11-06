
'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import { toast } from './use-toast';
import type { Project, Section } from '@/lib/models';
import { templates } from '@/lib/docx-styles'; // Assuming default styles are needed for options

export function useExport() {
    const [isExporting, setIsExporting] = useState(false);

    /**
     * Exports a report as a DOCX file by calling the server-side API.
     * @param sections The array of Section objects to include in the export.
     * @param projectName The name for the exported file.
     */
    const exportReportDocx = async (sections: Section[], projectName: string) => {
        if (!sections || sections.length === 0) {
            toast({ title: 'Export Canceled', description: 'No content selected to export.', variant: 'destructive' });
            return;
        }
        setIsExporting(true);
        try {
            // Consolidate all markdown content into a single string, separated by page breaks.
            // The server will handle splitting this back into sections if needed, or process as one doc.
            const fullMarkdown = sections
                .map(section => `# ${section.title}\n\n${section.content || ''}`)
                .join('\n\n---\n\n');
            
            // Prepare options, could be expanded later to include template choice
            const options = {
                styles: templates.modern.styles,
                customStyles: templates.modern.customStyles,
                pageNumbers: true,
                isRtl: false, // Default, can be made configurable
            };

            const response = await fetch('/api/export/docx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    markdown: fullMarkdown,
                    fileName: projectName.replace(/\s+/g, '_'),
                    options: options,
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
