
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Agent } from '@/lib/models/agent';
import type { SectionName } from '@/ai/schemas';
import { useBuilderStore } from '@/hooks';

export function useReportPaginator(generatedSections: SectionName[], reportAgents: Agent[]) {
    const { project } = useBuilderStore();
    const [currentPage, setCurrentPage] = useState(0);

    const orderedSections = useMemo(() => {
        const generatedIdSet = new Set(generatedSections);
        const allKnownSectionIds = Object.keys(project?.sections || {});

        const projectOrder = project?.sectionsOrder?.filter(id => allKnownSectionIds.includes(id)) || [];

        const finalOrder = [...projectOrder];
        allKnownSectionIds.forEach(id => {
            if (!finalOrder.includes(id)) {
                finalOrder.push(id);
            }
        });
        
        return finalOrder;

    }, [project?.sections, project?.sectionsOrder, generatedSections]);


    const totalPages = orderedSections.length;
    const currentSectionKey = orderedSections[currentPage];

    // If the current page becomes invalid (e.g. sections are removed), reset to the first page.
    useEffect(() => {
        if (currentPage >= totalPages && totalPages > 0) {
            setCurrentPage(totalPages - 1);
        } else if (totalPages === 0) {
            setCurrentPage(0);
        }
    }, [currentPage, totalPages]);


    const getSectionTitle = (key: SectionName) => {
        const customTitle = project?.sections?.[key]?.title;
        if (customTitle && customTitle !== key) {
            return customTitle;
        }
        return reportAgents.find(a => a.id === key)?.name || key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
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
        setCurrentPage,
    };
}
