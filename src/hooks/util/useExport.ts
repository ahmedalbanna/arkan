'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import { toast } from './use-toast';
import type { Project, ProjectContent } from '@/lib/models';
import { templates as docxTemplates, type DocxTemplateKey } from '@/lib/docx-styles';
import { templates as pptxTemplates, type PptxTemplateKey } from '@/lib/pptx-styles';
import { ConversionOptions } from '@/lib/word-converter/types';
import { PptxConversionOptions, convertMarkdownToPptx } from '@/lib/markdown-to-pptx-converter';

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

    const generateMarkdownFromContent = (content: ProjectContent) => {
      return content.map(item => {
        if ('sections' in item) { // Chapter
            const chapterContent = `# ${item.title}`;
            const sectionsContent = item.sections.map(section => `## ${section.title}\n\n${section.content || ''}`).join('\n\n');
            return `${chapterContent}\n\n${sectionsContent}`;
        } else { // Section
            return `# ${item.title}\n\n${item.content || ''}`;
        }
      }).join('\n\n<!-- slide-break -->\n\n');
    }

    /**
     * Exports a report as a DOCX file by calling the server-side API.
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
            
            const apiOptions: ConversionOptions = {
                styles: templateStyles.styles,
                customStyles: templateStyles.customStyles,
                pageNumbers: options.pageNumbers,
                isRtl: false, // Defaulting to LTR for now
            };

            const markdownToExport = generateMarkdownFromContent(selectedContent);

            // FIX: Append all footnote definitions to ensure references are resolved.
            const fullMarkdown = project.fullMarkdownContent;
            const footnoteRegex = /^\[\^.+?\]:.+$/gm;
            const footnoteDefinitions = fullMarkdown.match(footnoteRegex);

            let finalMarkdown = markdownToExport;
            if (footnoteDefinitions) {
                finalMarkdown += '\n\n' + footnoteDefinitions.join('\n');
            }

            const response = await fetch('/api/export/docx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project: project.toStateObject(),
                    markdown: finalMarkdown,
                    options: apiOptions,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to generate DOCX file on the server.');
            }

            const blob = await response.blob();
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

            const conversionOptions: PptxConversionOptions = {
                styles: templateStyles.styles,
                isRtl: options.isRtl,
                includeToc: options.includeToc,
            };

            const markdownToExport = generateMarkdownFromContent(selectedContent);

            // FIX: Append all footnote definitions to ensure references are resolved.
            const fullMarkdown = project.fullMarkdownContent;
            const footnoteRegex = /^\[\^.+?\]:.+$/gm;
            const footnoteDefinitions = fullMarkdown.match(footnoteRegex);

            let finalMarkdown = markdownToExport;
            if (footnoteDefinitions) {
                finalMarkdown += '\n\n' + footnoteDefinitions.join('\n');
            }

            const blob = await convertMarkdownToPptx(finalMarkdown, project.name, conversionOptions);
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
