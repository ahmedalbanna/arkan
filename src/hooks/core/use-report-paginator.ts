
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { SectionName } from '@/ai/schemas';
import { useBuilderStore } from '@/hooks';
import type { Section } from '@/lib/models';


export function useReportPaginator(generatedSections: SectionName[]) {
    const { project } = useBuilderStore();
    const [currentPage, setCurrentPage] = useState(0);

    const orderedSections = useMemo((): Section[] => {
        if (!project || !project.chapters || project.chapters.length === 0) return [];
        return project.chapters.flatMap(chapter => chapter.sections || []);
    }, [project?.chapters]);


    const totalPages = orderedSections.length;
    const currentItem = orderedSections[currentPage];

     useEffect(() => {
        if (currentPage >= totalPages && totalPages > 0) {
            setCurrentPage(totalPages - 1);
        } else if (totalPages === 0) {
            setCurrentPage(0);
        }
    }, [totalPages, currentPage]);

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
    };

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 0));
    };

    return {
        currentPage,
        totalPages,
        currentItem,
        setCurrentPage,
        handleNextPage,
        handlePrevPage,
    };
}
