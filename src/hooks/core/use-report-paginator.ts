
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Agent } from '@/lib/models/agent';
import type { SectionName } from '@/ai/schemas';
import { useBuilderStore } from '@/hooks';

export function useReportPaginator(generatedSections: SectionName[], reportAgents: Agent[]) {
    const { project } = useBuilderStore();
    const [currentPage, setCurrentPage] = useState(0);

    const orderedSections = useMemo(() => {
        // Use the order from the project if available, otherwise just use the list of generated sections
        const order = project?.sectionsOrder?.filter(id => generatedSections.includes(id as SectionName)) ?? generatedSections;
        // Add any generated sections that might be missing from the saved order
        generatedSections.forEach(id => {
            if (!order.includes(id)) {
                order.push(id);
            }
        });
        return order;
    }, [generatedSections, project?.sectionsOrder]);

    const totalPages = orderedSections.length;
    const currentSectionKey = orderedSections[currentPage];

    // If the current page becomes invalid (e.g. sections are removed), reset to the first page.
    useEffect(() => {
        if (currentPage >= totalPages && totalPages > 0) {
            setCurrentPage(0);
        }
    }, [currentPage, totalPages]);


    const getSectionTitle = (key: SectionName) => {
        // First, check if a title is explicitly set in the project sections
        const customTitle = project?.sections?.[key]?.title;
        if (customTitle && customTitle !== key) {
            return customTitle;
        }

        // If not, fall back to the agent name
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
