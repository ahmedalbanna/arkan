'use client';

import { useState, useEffect } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { useReportStore } from '@/hooks';
import { useDiagramStore } from '@/hooks';
import { useDocxStyles } from '@/hooks';
import { useExport } from '@/hooks';
import { SectionName } from '@/ai/schemas';
import { useSectionStore } from '@/hooks';
import { TemplateKey } from '@/lib/docx-styles';

const DOCX_TEMPLATE_KEY = 'arkan-docx-template';

export const useReportActions = (isTranslating: boolean) => {
  const { t } = useLocalization();
  const { proposal } = useBuilderStore();
  const { sections } = useReportStore();
  const { diagrams } = useDiagramStore();
  const { templates: docxTemplates, isLoaded: docxLoaded } = useDocxStyles();
  const [selectedDocxTemplate, setSelectedDocxTemplate] = useState<TemplateKey>('modern');
  const { exportReportDocx, isExporting } = useExport();

  const generatedSectionKeys = Object.keys(sections).filter(key => sections[key as SectionName]) as SectionName[];
  const [selectedSectionsForExport, setSelectedSectionsForExport] = useState<SectionName[]>(generatedSectionKeys);
  const { reportSections } = useSectionStore();

  // Update selection when generated sections change
  useEffect(() => {
    setSelectedSectionsForExport(generatedSectionKeys);
  }, [JSON.stringify(generatedSectionKeys)]);

  useEffect(() => {
    const savedDocxTemplate = localStorage.getItem(DOCX_TEMPLATE_KEY) as TemplateKey | null;
    if (savedDocxTemplate && docxTemplates && docxTemplates[savedDocxTemplate]) {
      setSelectedDocxTemplate(savedDocxTemplate);
    }
  }, [docxTemplates]);

  const handleDocxTemplateChange = (key: TemplateKey) => {
    setSelectedDocxTemplate(key);
    localStorage.setItem(DOCX_TEMPLATE_KEY, key);
  };

  const hasContent = Object.values(sections).some(s => !!s) || Object.values(diagrams || {}).some(d => !!d);

  const handleExportReportDOCX = async () => {
    if (!hasContent) return;
    let proposalTitle = 'Project Report';
    if (proposal && proposal.title) {
      proposalTitle = String(proposal.title);
    }

    const translatedTitles = Object.keys(reportSections).reduce((acc, key) => {
      acc[key as SectionName] = t(reportSections[key as SectionName].title);
      return acc;
    }, {} as { [key in SectionName]?: string });

    const sectionsToExport = selectedSectionsForExport.reduce((acc, key) => {
      if (sections[key]) {
        acc[key] = sections[key];
      }
      return acc;
    }, {} as { [key in SectionName]?: string });

    await exportReportDocx(sectionsToExport, diagrams || {}, proposalTitle, selectedDocxTemplate, translatedTitles, selectedSectionsForExport);
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
