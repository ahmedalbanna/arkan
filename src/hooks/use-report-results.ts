
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useBuilderStore } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';
import { useSections } from '@/hooks';
import type { SectionName } from '@/ai/schemas';
import { FileText } from 'lucide-react';
import { useAgentStore } from './useAgentStore';
import { useTranslate } from './use-translation';
import { toast } from './use-toast';
import { Project } from '@/lib/models/project';
import { useSectionLogic } from './use-section-logic';


export const useReportResults = () => {
  const { project, setProject } = useBuilderStore();
  const { t } = useLocalization();
  const { data: sectionConfigs } = useSections();
  const getIconComponent = useAgentStore(state => state.getIconComponent);

  const [currentPage, setCurrentPage] = useState(0);

  const sections = project?.sections || {};
  const translatedSections = project?.translatedSections || {};

  const generatedSections = useMemo(
    () => (Object.keys(sections) as SectionName[]).filter(key => sections[key]),
    [sections]
  );

  const totalPages = generatedSections.length;

  useEffect(() => {
    setCurrentPage(0);
  }, [totalPages]);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const hasContent = generatedSections.length > 0;
  const currentSectionKey = hasContent ? generatedSections[currentPage] : undefined;

  const sectionConfigMap = useMemo(() => {
    if (!sectionConfigs) return {};
    return sectionConfigs.reduce((acc, sec) => {
      acc[sec.id] = sec;
      return acc;
    }, {} as Record<string, any>);
  }, [sectionConfigs]);

  const getSectionTitle = (key: SectionName): string => {
    if (!sectionConfigMap[key] || !sectionConfigMap[key].title) {
        return key; // Fallback to the key if title isn't loaded
    }
    return t(sectionConfigMap[key]?.title) || key;
  };

  const getSectionIcon = (key: SectionName) => {
    const iconName = sectionConfigMap[key]?.icon;
    return getIconComponent(iconName) || FileText;
  };

  // Logic from useSectionLogic is now integrated here
  const {
      isProcessingAi,
      handleAiAction,
      handleReadAloud,
      ttsMutation,
      words,
      chars
  } = useSectionLogic(
      currentSectionKey!,
      currentSectionKey ? sections[currentSectionKey!]! : '',
      (key, value) => {
          if (project) {
              project.updateSectionContent(key, value);
              setProject(new Project(project.toStateObject()));
          }
      }
  );


  return {
    t,
    sections,
    currentPage,
    totalPages,
    handleNextPage,
    handlePrevPage,
    hasContent,
    currentSectionKey,
    getSectionTitle,
    getSectionIcon,
    isProcessingAi,
    handleAiAction,
    handleReadAloud,
    ttsMutation,
    words,
    chars
  };
};
