
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

export const useReportResults = () => {
  const { project, setProject } = useBuilderStore();
  const { t } = useLocalization();
  const { data: sectionConfigs } = useSections();
  const getIconComponent = useAgentStore(state => state.getIconComponent);

  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState<'content' | 'generator' | 'evaluator'>('generator');
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);
  const translateMutation = useTranslate();


  const sections = project?.sections || {};

  const generatedSections = useMemo(
    () => (Object.keys(sections) as SectionName[]).filter(key => sections[key]),
    [sections]
  );

  const totalPages = generatedSections.length;

  // Reset to first page when generated sections change
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

  const handleTranslateAll = async (targetLang: 'en' | 'ar') => {
      if (!project?.sections) return;

      setIsTranslatingAll(true);
      toast({
          title: t('builder.reportGenerator.toasts.translateAllStarted'),
          description: t('builder.reportGenerator.toasts.translateAllStartedDesc'),
      });

      const sectionKeys = Object.keys(project.sections).filter(key => project.sections![key as SectionName]) as SectionName[];
      const translationPromises = sectionKeys.map(key => {
          const content = project.sections![key]!;
          return translateMutation.mutateAsync({ text: content, targetLang })
              .then(result => ({ key, content: result.translatedText }))
              .catch(error => ({ key, error }));
      });
      const results = await Promise.all(translationPromises);
      const translatedMap: { [key in SectionName]?: string } = {};

      results.forEach(result => {
          if ('content' in result) {
              translatedMap[result.key as SectionName] = result.content;
          } else {
              console.error(`Failed to translate section ${result.key}:`, result.error);
          }
      });
      
      setProject(new Project({ ...project.toPlainObject(), translatedSections: { ...project.translatedSections, ...translatedMap } }));
      setIsTranslatingAll(false);
      toast({
          title: t('builder.reportGenerator.toasts.translateAllSuccess'),
          description: t('builder.reportGenerator.toasts.translateAllSuccessDesc'),
      });
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
    return sectionConfigMap[key]?.title || key;
  };

  const getSectionIcon = (key: SectionName) => {
    const iconName = sectionConfigMap[key]?.icon;
    return getIconComponent(iconName) || FileText;
  };

  return {
    t,
    sections,
    currentPage,
    totalPages,
    activeTab,
    setActiveTab,
    handleNextPage,
    handlePrevPage,
    hasContent,
    currentSectionKey,
    getSectionTitle,
    getSectionIcon,
    handleTranslateAll,
    isTranslatingAll,
  };
};
