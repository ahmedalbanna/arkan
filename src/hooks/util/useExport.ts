'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import { toast } from './use-toast';
import type { Project, ProjectContent } from '@/modules/projects/domain/entities/Project';
import { templates as docxTemplates, type DocxTemplateKey } from '@/modules/ai-content/infrastructure/exporters/DocxStyles';
import { templates as pptxTemplates, type PptxTemplateKey } from '@/modules/templates/infrastructure/PptxStyles';
import type { ConversionOptions } from '@/modules/ai-content/domain/types/export-types';
import { container } from '@/infrastructure/di/container';
import { IPptxExportServiceToken } from '@/modules/ai-content/domain/services/IExportService';
import { apiService } from '@/infrastructure/api/ApiService';

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
        isRtl: false,
      };

      const selectedContentPlain = selectedContent.map((item) => item.toProperties());
      const blob = await apiService<
        { project: ReturnType<Project['toProperties']>; selectedContent: unknown[]; options: Omit<ConversionOptions, 'coverPageMarkdown'> },
        Blob
      >({
        endpoint: '/api/export/docx',
        method: 'POST',
        data: {
          project: project.toProperties(),
          selectedContent: selectedContentPlain,
          options: apiOptions,
        },
        responseType: 'blob',
      });

      saveAs(blob, `${project.name.replace(/\s+/g, '_')}_report.docx`);
      toast({ title: 'Export Successful', description: 'Report exported as DOCX.' });
    } catch (error: unknown) {
      console.error('DOCX Export Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Could not generate the DOCX file.';
      toast({
        title: 'Export Failed',
        description: errorMessage,
        variant: 'destructive',
        duration: 7000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportPresentationPptx = async ({ project, options, selectedContent }: PptxExportParams) => {
    if (selectedContent.length === 0) {
      toast({ title: 'Export Canceled', description: 'No content selected to export.', variant: 'destructive' });
      return;
    }

    setIsExporting(true);
    try {
      const templateStyles = pptxTemplates[options.template] || pptxTemplates.modern;
      const client = container.resolve<any>(IPptxExportServiceToken);

      const result = await client.export(project, selectedContent, {
        styles: templateStyles.styles,
        isRtl: options.isRtl,
        includeToc: options.includeToc,
      });

      const blob = result instanceof Blob
        ? result
        : new Blob([result as any], {
            type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          });
      saveAs(blob, `${project.name.replace(/\s+/g, '_')}_presentation.pptx`);

      toast({ title: 'Export Successful', description: 'Presentation exported as PPTX.' });
    } catch (error: unknown) {
      console.error('PPTX Export Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Could not generate the PPTX file.';
      toast({
        title: 'Export Failed',
        description: errorMessage,
        variant: 'destructive',
        duration: 7000,
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
