
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useReportStore, useDocxStyles, useExport, useSections } from '@/hooks';
import type { SectionName } from '@/ai/schemas';
import type { DocxTemplateKey } from '@/lib/docx-styles';

const DOCX_TEMPLATE_KEY = 'arkan-docx-template';

export const useReportActions = (isTranslating: boolean) => {
  const { t } = useLocalization();
  const { project } = useBuilderStore();
  const { templates: docxTemplates, isLoaded: docxLoaded } = useDocxStyles();
  const [selectedDocxTemplate, setSelectedDocxTemplate] = useState<DocxTemplateKey >('modern');
  const { exportReportDocx, isExporting } = useExport();

  const sections = project?.sections || {};
  const diagrams = project?.diagrams || {};

  const generatedSectionKeys = Object.keys(sections).filter(key => sections[key as SectionName]) as SectionName[];
  const [selectedSectionsForExport, setSelectedSectionsForExport] = useState<SectionName[]>(generatedSectionKeys);

  const { data: sectionConfigs } = useSections();
  const reportSections = useMemo(() => {
      if (!sectionConfigs) return {};
      return sectionConfigs.filter(s => s.type === 'report').reduce((acc, sec) => {
          acc[sec.id] = sec;
          return acc;
      }, {} as Record<string, any>);
  }, [sectionConfigs]);

  useEffect(() => {
    setSelectedSectionsForExport(generatedSectionKeys);
  }, [JSON.stringify(generatedSectionKeys)]);

  useEffect(() => {
    const savedDocxTemplate = localStorage.getItem(DOCX_TEMPLATE_KEY) as DocxTemplateKey | null;
    if (savedDocxTemplate && docxTemplates && docxTemplates[savedDocxTemplate]) {
      setSelectedDocxTemplate(savedDocxTemplate);
    }
  }, [docxTemplates]);

  const handleDocxTemplateChange = (key: DocxTemplateKey ) => {
    setSelectedDocxTemplate(key);
    localStorage.setItem(DOCX_TEMPLATE_KEY, key);
  };

  const hasContent = Object.values(sections).some(s => !!s) || Object.values(diagrams || {}).some(d => !!d);

  const handleExportReportDOCX = async () => {
    if (!project || !hasContent) return;

    const translatedTitles = Object.keys(reportSections).reduce((acc, key) => {
      acc[key as SectionName] = t(reportSections[key as SectionName]?.title || key);
      return acc;
    }, {} as { [key in SectionName]?: string });

    await exportReportDocx(project, selectedDocxTemplate, translatedTitles, selectedSectionsForExport);
  };

  const isBusy = isTranslating || isExporting;

  return {
    t,
    isBusy,
    hasContent,
    docxTemplates,
    docxLoaded,
    selectedDocxTemplate,
    handleDocxTemplateChange,
    generatedSectionKeys,
    selectedSectionsForExport,
    setSelectedSectionsForExport,
    handleExportReportDOCX,
    isExporting,
    reportSections,
  };
};
