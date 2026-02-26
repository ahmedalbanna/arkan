'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import { toast } from './use-toast';
import type { Project, ProjectContent } from '@/modules/projects/domain/entities/Project';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { templates as docxTemplates, type DocxTemplateKey } from '@/modules/ai-content/infrastructure/exporters/DocxStyles';
import { templates as pptxTemplates, type PptxTemplateKey } from '@/modules/templates/infrastructure/PptxStyles';
import { ConversionOptions } from '@/modules/ai-content/infrastructure/exporters/word-converter/types';
import { container } from '@/infrastructure/di/container';
import { IDocxExportServiceToken, IPptxExportServiceToken } from '@/modules/ai-content/domain/services/IExportService';

interface DocxExportParams {
    project: Project;
    options: {
        template: DocxTemplateKey;
        pageNumbers: boolean;
    };
    selectedContent: ProjectContent;
}

interface PptxExportParams {
    project: Project;
    options: {
        template: PptxTemplateKey;
        isRtl: boolean;
        includeToc: boolean;
    };
    selectedContent: ProjectContent;
}

export function useExport() {
    const [isExporting, setIsExporting] = useState(false);

    /**
     * Exports a report as a DOCX file by calling the server-side API.
     * The server now handles markdown generation from the project object.
     * @param params - An object containing the project, export options, and selected content.
     */
    const exportReportDocx = async ({ project, options, selectedContent }: DocxExportParams) => {
        if (selectedContent.length === 0) {
            toast({ title: 'Export Canceled', description: 'No content selected to export.', variant: 'destructive' });
            return;
        }
        setIsExporting(true);
        try {
            const templateStyles = docxTemplates[options.template] || docxTemplates.modern;
            
            const apiOptions: Omit<ConversionOptions, 'coverPageMarkdown'> = {
                styles: templateStyles.styles,
                customStyles: templateStyles.customStyles,
                pageNumbers: options.pageNumbers,
                isRtl: false, // Defaulting to LTR for now
            };

            const selectedContentPlain = selectedContent.map(item => item.toStateObject());

            const response = await fetch('/api/export/docx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project: project.toStateObject(),
                    selectedContent: selectedContentPlain,
                    options: apiOptions,
                }),
            });

            if (!response.ok) {
                let errorMessage = 'Failed to generate DOCX file on the server.';
                try {
                    const errorData = await response.json();
                    if (typeof errorData === 'string') {
                        errorMessage = errorData;
                    } else if (errorData && errorData.message) {
                        errorMessage = errorData.message;
                        // Include additional error details if available
                        if (errorData.error) {
                            errorMessage += `\n\nDetails: ${errorData.error}`;
                        }
                    }
                } catch (parseError) {
                    // If response is not JSON, use status text
                    errorMessage = `Server error: ${response.statusText || response.status}`;
                }
                throw new Error(errorMessage);
            }

            const blob = await response.blob();
            saveAs(blob, `${project.name.replace(/\s+/g, '_')}_report.docx`);

            toast({ title: 'Export Successful', description: 'Report exported as DOCX.' });
        } catch (error) {
            console.error('DOCX Export Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Could not generate the DOCX file.';
            toast({ 
                title: 'Export Failed', 
                description: errorMessage, 
                variant: 'destructive',
                duration: 7000 // Show error longer for user to read
            });
        } finally {
            setIsExporting(false);
        }
    };
    
    /**
     * Exports a report as a PPTX file by generating it on the client side.
     * Note: PPTX generation must remain client-side because it uses canvas/document APIs
     * @param params - An object containing the project, export options, and selected content.
     */
    const exportPresentationPptx = async ({ project, options, selectedContent }: PptxExportParams) => {
        if (selectedContent.length === 0) {
            toast({ title: 'Export Canceled', description: 'No content selected to export.', variant: 'destructive' });
            return;
        }
        
        setIsExporting(true);
        try {
            const templateStyles = pptxTemplates[options.template] || pptxTemplates.modern;
            const client = container.resolve(IPptxExportServiceToken);
            
            const result = await client.export(project, selectedContent, {
                styles: templateStyles.styles,
                isRtl: options.isRtl,
                includeToc: options.includeToc,
            });

            const blob = result instanceof Blob ? result : new Blob([result as any], { 
                type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
            });
            saveAs(blob, `${project.name.replace(/\s+/g, '_')}_presentation.pptx`);

            toast({ title: 'Export Successful', description: 'Presentation exported as PPTX.' });
        } catch (error) {
            console.error('PPTX Export Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Could not generate the PPTX file.';
            toast({ 
                title: 'Export Failed', 
                description: errorMessage, 
                variant: 'destructive',
                duration: 7000
            });
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
