

'use client';

import { useState, useMemo, useCallback } from 'react';
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

export const useReportModeGenerator = () => {
    const { t, locale } = useLocalization();
    const { project, setProject } = useBuilderStore();
    const translateMutation = useTranslate();
    const [isTranslatingAll, setIsTranslatingAll] = useState(false);
    
    const { data: sectionConfigs } = useSections();
    const getIconComponent = useAgentStore(state => state.getIconComponent);
    const { exportReportDocx, isExporting } = useExport();

    const [currentPage, setCurrentPage] = useState(0);

    const sections = project?.sections || {};
    const translatedSections = project?.translatedSections || {};

    const generatedSections = useMemo(
        () => (Object.keys(sections) as SectionName[]).filter(key => sections[key]),
        [sections]
    );

    const totalPages = generatedSections.length;

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    }, [totalPages]);

    useEffect(() => {
        // Reset to first page if the number of pages changes (e.g., a section is added/removed)
        setCurrentPage(0);
    }, [totalPages]);


    const handleNextPage = () => handlePageChange(currentPage + 1);
    const handlePrevPage = () => handlePageChange(currentPage - 1);


    const hasContent = generatedSections.length > 0;
    const currentSectionKey = hasContent ? generatedSections[currentPage] : undefined;

    const sectionConfigMap = useMemo(() => {
        if (!sectionConfigs) return {};
        return sectionConfigs.reduce((acc, sec) => {
            acc[sec.id] = sec;
            return acc;
        }, {} as Record<string, any>);
    }, [sectionConfigs]);

    const getSectionTitle = (key: SectionName): string => {
        if (!sectionConfigMap[key] || !sectionConfigMap[key].title) {
            return key; // Fallback to the key if title isn't loaded
        }
        return t(sectionConfigMap[key]?.title) || key;
    };

    const getSectionIcon = (key: SectionName) => {
        const iconName = sectionConfigMap[key]?.icon;
        return getIconComponent(iconName) || FileText;
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

    const reportSections = useMemo(() => {
        if (!sectionConfigs) return {};
        return sectionConfigs.filter(s => s.type === 'report').reduce((acc, sec) => {
            acc[sec.id] = sec;
            return acc;
        }, {} as Record<string, any>);
    }, [sectionConfigs]);

    const handleExportReportDOCX = async (sectionsToInclude: SectionName[]) => {
        if (!project || !hasContent) return;

        const translatedTitles = Object.keys(reportSections).reduce((acc, key) => {
            acc[key as SectionName] = t(reportSections[key as SectionName]?.title || key);
            return acc;
        }, {} as { [key in SectionName]?: string });

        await exportReportDocx(project, "modern", translatedTitles, sectionsToInclude);
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
        reportSections
    };
};
