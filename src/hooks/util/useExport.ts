'use client';

import { apiService } from '@/infrastructure/api/ApiService';
import type { ConversionOptions } from '@/modules/ai-content/domain/types/export-types';
import { templates as docxTemplates, type DocxTemplateKey } from '@/modules/ai-content/infrastructure/exporters/DocxStyles';
import type { Project, ProjectContent } from '@/modules/projects/domain/entities/Project';
import { templates as pptxTemplates, type PptxTemplateKey } from '@/modules/templates/infrastructure/PptxStyles';
import { saveAs } from 'file-saver';
import { useCallback, useState } from 'react';
import { toast } from './use-toast';

/**
 * useExport — Hook for orchestrating document production workflows.
 * Bridges the UI with server-side export API nodes.
 *
 * DEFENSIVE MEASURES:
 * 1. Consistent Pipeline: Transitions both DOCX and PPTX to use the API route vector.
 * 2. Execution Containment: Wraps async transmissions in try-catch blocks.
 * 3. Validation: Guards against empty content selections.
 * 4. UX Integrity: Integrated toast notifications for production status.
 */

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

  const exportReportDocx = useCallback(async ({ project, options, selectedContent }: DocxExportParams) => {
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
        isRtl: false,
      };

      const blob = await apiService<any, Blob>({
        endpoint: '/api/export/docx',
        method: 'POST',
        data: {
          project: project.toProperties(),
          selectedContent: selectedContent.map((item) => item.toProperties()),
          options: apiOptions,
        },
        responseType: 'blob',
      });

      if (!blob) throw new Error('DOCX synthesis returned an empty payload.');

      saveAs(blob, `${project.name.replace(/\s+/g, '_')}_report.docx`);
      toast({ title: 'Export Successful', description: 'Your academic report has been synthesized.' });
    } catch (error: unknown) {
      console.error('[Hook:Export] DOCX Failure:', error);
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'The DOCX production pipeline encountered an error.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  }, []);

  const exportPresentationPptx = useCallback(async ({ project, options, selectedContent }: PptxExportParams) => {
    if (selectedContent.length === 0) {
      toast({ title: 'Export Canceled', description: 'No content selected to export.', variant: 'destructive' });
      return;
    }

    setIsExporting(true);
    try {
      const templateStyles = pptxTemplates[options.template] || pptxTemplates.modern;

      const blob = await apiService<any, Blob>({
        endpoint: '/api/export/pptx',
        method: 'POST',
        data: {
          project: project.toProperties(),
          selectedContent: selectedContent.map((item) => item.toProperties()),
          options: {
            styles: templateStyles.styles,
            isRtl: options.isRtl,
            includeToc: options.includeToc,
          },
        },
        responseType: 'blob',
      });

      if (!blob) throw new Error('PPTX synthesis returned an empty payload.');

      saveAs(blob, `${project.name.replace(/\s+/g, '_')}_presentation.pptx`);
      toast({ title: 'Export Successful', description: 'Your slide-deck has been synthesized.' });
    } catch (error: unknown) {
      console.error('[Hook:Export] PPTX Failure:', error);
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'The PPTX production pipeline encountered an error.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    isExporting,
    exportReportDocx,
    exportPresentationPptx,
  };
}
