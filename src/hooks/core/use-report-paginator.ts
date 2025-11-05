
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useBuilderStore } from '@/hooks';
import type { Chapter } from '@/lib/models';


export function useReportPaginator() {
    const { project } = useBuilderStore();
    const [currentPage, setCurrentPage] = useState(0);

    const chapters = useMemo((): Chapter[] => {
        if (!project || !project.chapters || project.chapters.length === 0) return [];
        return project.chapters;
    }, [project?.chapters]);


    const totalPages = chapters.length;
    const currentItem = chapters[currentPage]; // Now currentItem is a Chapter

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
