
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useTranslate, useSections } from '@/hooks';
import { toast } from '@/hooks';
import type { SectionName } from '@/ai/schemas';
import { useBuilderStore } from '@/hooks';
import { Project } from '@/lib/models/project';
import { useExport } from './use-export';

export const useReportModeGenerator = ({ orderedSections, setOrderedSections }: { orderedSections: import('@/lib/models/section').Section[], setOrderedSections: (sections: import('@/lib/models/section').Section[]) => void; }) => {
    const { t, locale } = useLocalization();
    const { project, setProject } = useBuilderStore();
    const translateMutation = useTranslate();
    const [isTranslatingAll, setIsTranslatingAll] = useState(false);
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    
    const { exportReportDocx, isExporting } = useExport();

    const { data: sectionConfigs } = useSections();

    const sections = project?.sections || {};

    const generatedSections = useMemo(
        () => (orderedSections || []).filter(section => sections[section.id as SectionName]),
        [sections, orderedSections]
    );

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

    const handleExportReportDOCX = async (sectionsToInclude: SectionName[]) => {
        if (!project || generatedSections.length === 0) return;

        const translatedTitles = sectionConfigs?.reduce((acc, sec) => {
            acc[sec.id as SectionName] = sec.title; // No need for t() here, we use the direct title
            return acc;
        }, {} as { [key in SectionName]?: string }) || {};

        await exportReportDocx(project, translatedTitles, sectionsToInclude);
    };
    
    const getSectionTitle = useCallback((sectionKey: SectionName) => {
        return sectionConfigs?.find(s => s.id === sectionKey)?.title || sectionKey;
    }, [sectionConfigs]);

    useEffect(() => {
        if (!orderedSections.length && sectionConfigs) {
            const reportSectionConfigs = sectionConfigs.filter(s => s.type === 'report').sort((a, b) => a.title.localeCompare(b.title));
            setOrderedSections(reportSectionConfigs);
        }
    }, [orderedSections, setOrderedSections, sectionConfigs]);


    return {
        t,
        locale,
        isPanelCollapsed,
        setIsPanelCollapsed,
        handleSectionUpdate,
        handleTranslateAll,
        isTranslatingAll,
        generatedSections,
        isExporting,
        handleExportReportDOCX,
        sections, // Pass sections state
        getSectionTitle, // Pass helper function
    };
};
