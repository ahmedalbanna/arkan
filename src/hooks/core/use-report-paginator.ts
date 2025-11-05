
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { SectionName } from '@/ai/schemas';
import { useBuilderStore } from '@/hooks';

// New type to represent a page in the report, which can be a chapter or a section
export type PageItem = {
    type: 'chapter';
    id: string; // chapter id
    title: string;
} | {
    type: 'section';
    id: string; // section id
    chapterId: string;
};

export function useReportPaginator(generatedSections: SectionName[]) {
    const { project } = useBuilderStore();
    const [currentPage, setCurrentPage] = useState(0);

    const orderedPages = useMemo((): PageItem[] => {
        if (!project || !project.chapters || project.chapters.length === 0) return [];
        
        const pages: PageItem[] = [];
        
        project.chapters.forEach(chapter => {
            // Add a page for the chapter title itself
            pages.push({
                type: 'chapter',
                id: chapter.id,
                title: chapter.title,
            });

            // Add pages for each section within the chapter
            chapter.sections.forEach(section => {
                pages.push({
                    type: 'section',
                    id: section.id,
                    chapterId: chapter.id,
                });
            });
        });

        return pages;
    }, [project?.chapters]);


    const totalPages = orderedPages.length;
    const currentItem = orderedPages[currentPage];

     useEffect(() => {
        if (currentPage >= totalPages && totalPages > 0) {
            setCurrentPage(totalPages - 1);
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
