

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useTranslate } from '@/hooks';
import { toast } from '@/hooks';
import type { SectionName } from '@/ai/schemas';
import { useBuilderStore } from '@/hooks';
import { Project } from '@/lib/models/project';
import { useSections } from './use-sections';
import { useAgentStore } from './useAgentStore';
import { FileText } from 'lucide-react';
import { useExport } from './use-export';
import { reportSections as staticReportSections } from '@/lib/db/seed-data/sections-templates';

export const useReportModeGenerator = (orderedSections: SectionName[]) => {
    const { t, locale } = useLocalization();
    const { project, setProject } = useBuilderStore();
    const translateMutation = useTranslate();
    const [isTranslatingAll, setIsTranslatingAll] = useState(false);
    
    // Removed useSections and useAgentStore hooks as we're using static data now.
    const { exportReportDocx, isExporting } = useExport();

    const [currentPage, setCurrentPage] = useState(0);

    const sections = project?.sections || {};
    const translatedSections = project?.translatedSections || {};

    const generatedSections = useMemo(
        () => orderedSections.filter(key => sections[key]),
        [sections, orderedSections]
    );

    const totalPages = generatedSections.length;

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    }, [totalPages]);

    useEffect(() => {
        if (currentPage >= totalPages && totalPages > 0) {
            setCurrentPage(totalPages - 1);
        } else if (totalPages === 0) {
            setCurrentPage(0);
        }
    }, [totalPages, currentPage]);


    const handleNextPage = () => handlePageChange(currentPage + 1);
    const handlePrevPage = () => handlePageChange(currentPage - 1);


    const hasContent = generatedSections.length > 0;
    const currentSectionKey = hasContent ? generatedSections[currentPage] : undefined;

    const sectionConfigMap = staticReportSections;

    const getSectionTitle = (key: SectionName): string => {
        if (!sectionConfigMap[key] || !sectionConfigMap[key].title) {
            return key; 
        }
        return t(sectionConfigMap[key]?.title) || key;
    };

    const getSectionIcon = (key: SectionName) => {
        const iconName = (sectionConfigMap[key] as any)?.icon;
        // This part becomes tricky as we don't have the icon components directly.
        // Let's assume a fallback for now.
        return FileText;
    };

    const handleSectionUpdate = (key: SectionName, value: string) => {
        if (!project) return;
        project.updateSectionContent(key, value);
        // Create a new Project instance to trigger a re-render in components that use the project object.
        setProject(new Project(project.toStateObject()));
    };

    const handleTranslateAll = async (targetLang: 'en' | 'ar') => {
        if (!project?.sections) return;

        setIsTranslatingAll(true);
        toast({
            title: t('builder.reportGenerator.toasts.translateAllStarted'),
            description: t('builder.reportGenerator.toasts.translateAllStartedDesc'),
        });

        const sectionKeys = Object.keys(project.sections).filter(key => project.sections![key as SectionName]) as SectionName[];

        const translationPromises = sectionKeys.map(key => {
            const content = project.sections![key]!;
            return translateMutation.mutateAsync({ text: content, targetLang })
                .then(result => ({ key, content: result.translatedText }))
                .catch(error => ({ key, error }));
        });

        const results = await Promise.all(translationPromises);

        const translatedMap: { [key in SectionName]?: string } = {};
        results.forEach(result => {
            if ('content' in result) {
                translatedMap[result.key as SectionName] = result.content;
            } else {
                console.error(`Failed to translate section ${result.key}:`, result.error);
            }
        });

        setProject(new Project({ ...project.toJSON(), translatedSections: { ...project.translatedSections, ...translatedMap } }));

        setIsTranslatingAll(false);
        toast({
            title: t('builder.reportGenerator.toasts.translateAllSuccess'),
            description: t('builder.reportGenerator.toasts.translateAllSuccessDesc'),
        });
    };

    const reportSectionsMap = useMemo(() => {
        return staticReportSections
    }, []);

    const handleExportReportDOCX = async (sectionsToInclude: SectionName[]) => {
        if (!project || !hasContent) return;

        const translatedTitles = Object.keys(reportSectionsMap).reduce((acc, key) => {
            acc[key as SectionName] = t(reportSectionsMap[key as SectionName]?.title || key);
            return acc;
        }, {} as { [key in SectionName]?: string });

        await exportReportDocx(project, translatedTitles, sectionsToInclude);
    };
    
    return {
        t,
        locale,
        handleSectionUpdate,
        handleTranslateAll,
        isTranslatingAll,
        sections,
        currentPage,
        totalPages,
        handleNextPage,
        handlePrevPage,
        hasContent,
        currentSectionKey,
        getSectionTitle,
        getSectionIcon,
        isExporting,
        handleExportReportDOCX,
        reportSections: reportSectionsMap
    };
};
