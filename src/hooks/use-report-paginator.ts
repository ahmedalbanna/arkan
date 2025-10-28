'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import type { SectionName } from '@/ai/schemas';
import type { Agent } from '@/lib/models/agent';

export function useReportPaginator(
  generatedSections: SectionName[],
  reportAgents: Agent[]
) {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = generatedSections.length;

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    } else if (totalPages === 0) {
      setCurrentPage(0);
    }
  }, [totalPages, currentPage]);

  const currentSectionKey = totalPages > 0 ? generatedSections[currentPage] : undefined;

  const getSectionTitle = useCallback((sectionKey: SectionName) => {
    return reportAgents?.find(a => a.id.includes(sectionKey))?.name || sectionKey;
  }, [reportAgents]);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };
  
  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  return {
    currentPage,
    totalPages,
    currentSectionKey,
    getSectionTitle,
    handleNextPage,
    handlePrevPage,
  };
}
