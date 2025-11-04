
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Agent } from '@/lib/models/agent';
import type { SectionName } from '@/ai/schemas';
import { useBuilderStore } from '@/hooks';

export function useReportPaginator(generatedSections: SectionName[], reportAgents: Agent[]) {
    const { project } = useBuilderStore();
    const [currentPage, setCurrentPage] = useState(0);

    const orderedSections = useMemo(() => {
        if (!project || !project.sections) return [];
        const projectSections = project.sections.filter(s => s.content && s.content.trim() !== '');

        // If a section order is defined, use it. Otherwise, just use the natural order.
        if (project.sectionsOrder && project.sectionsOrder.length > 0) {
            const orderSet = new Set(project.sectionsOrder);
            // Get all sections from the project that are in the defined order
            const ordered = project.sectionsOrder
                .map(id => project.sections.find(s => s.id === id))
                .filter(Boolean) as any[]; // `any` to satisfy TS for now, should be Section[]
            
            // Find any sections in the project that are NOT in the sectionsOrder array (e.g., newly created)
            const unordered = project.sections.filter(s => !orderSet.has(s.id));
            
            return [...ordered, ...unordered].map(s => s.id);
        }

        // Fallback to just the sections present in the project if no order is defined
        return project.sections.map(s => s.id);

    }, [project?.sections, project?.sectionsOrder]);


    const totalPages = orderedSections.length;
    const currentSectionKey = orderedSections[currentPage];

     useEffect(() => {
        const total = project?.sections?.length || 0;
        if (currentPage >= total && total > 0) {
            setCurrentPage(total - 1);
        }
    }, [project?.sections, currentPage]);


    const getSectionTitle = (key: SectionName) => {
        const section = project?.getSection(key);
        if (section?.title && section.title !== key) {
            return section.title;
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
