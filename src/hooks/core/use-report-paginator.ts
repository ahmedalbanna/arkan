
'use client';

import { useState, useMemo } from 'react';
import type { Agent } from '@/lib/models/agent';
import type { SectionName } from '@/ai/schemas';

export function useReportPaginator(generatedSections: SectionName[], reportAgents: Agent[]) {
    const [currentPage, setCurrentPage] = useState(0);

    const orderedSections = useMemo(() => {
        // This can be expanded with a more sophisticated sorting logic if needed
        return generatedSections;
    }, [generatedSections]);

    const totalPages = orderedSections.length;
    const currentSectionKey = orderedSections[currentPage];

    const getSectionTitle = (key: SectionName) => {
        return reportAgents.find(a => a.id === key)?.name || key.replace(/-/g, ' ');
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
    };

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 0));
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
