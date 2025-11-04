
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

        if (!project.sectionsOrder || project.sectionsOrder.length === 0) {
            return projectSections.map(s => s.id);
        }

        const orderSet = new Set(project.sectionsOrder);
        const ordered = project.sectionsOrder.map(id => projectSections.find(s => s.id === id)).filter(Boolean);
        const unordered = projectSections.filter(s => !orderSet.has(s.id));
        
        return [...ordered, ...unordered].map(s => s!.id);

    }, [project?.sections, project?.sectionsOrder]);


    const totalPages = orderedSections.length;
    const currentSectionKey = orderedSections[currentPage];

    useEffect(() => {
        if (currentPage >= totalPages && totalPages > 0) {
            setCurrentPage(totalPages - 1);
        } else if (totalPages === 0) {
            setCurrentPage(0);
        }
    }, [currentPage, totalPages]);


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
