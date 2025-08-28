'use client';

import { useState, useEffect } from 'react';
import { useReportStore } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';
import { useAgents } from '@/hooks';
import type { SectionName } from '@/ai/schemas';
import { FileText } from 'lucide-react';

export const useReportResults = () => {
  const { sections } = useReportStore();
  const { t } = useLocalization();
  const { agents } = useAgents();

  const [currentPage, setCurrentPage] = useState(0);

  const generatedSections = (Object.keys(sections) as SectionName[]).filter(key => sections[key]);
  const totalPages = generatedSections.length;

  // Reset to first page if the content changes
  useEffect(() => {
    setCurrentPage(0);
  }, [generatedSections.length]);

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
  const currentSectionKey = generatedSections[currentPage];

  const getSectionTitle = (key: SectionName): string => {
    const agent = agents.find(a => a.id.includes(key));
    return agent ? agent.name : key;
  };

  const getSectionIcon = (key: SectionName) => {
    const agent = agents.find(a => a.id.includes(key));
    return agent ? agent.icon : FileText;
  };

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
  };
};
