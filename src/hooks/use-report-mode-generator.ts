

'use client';

import { useState, useMemo, useCallback } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useTranslate } from '@/hooks';
import { toast } from '@/hooks';
import type { SectionName } from '@/ai/schemas';
import { useBuilderStore } from '@/hooks';
import { Project } from '@/lib/models/project';
import { useExport } from './use-export';
import { reportSections as staticReportSections } from '@/lib/db/seed-data/sections-templates';

export const useReportModeGenerator = ({ orderedSections, setOrderedSections }: { orderedSections: SectionName[], setOrderedSections: (sections: SectionName[]) => void; }) => {
    const { t, locale } = useLocalization();
    const { project, setProject } = useBuilderStore();
    const translateMutation = useTranslate();
    const [isTranslatingAll, setIsTranslatingAll] = useState(false);
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    
    const { exportReportDocx, isExporting } = useExport();

    const sections = project?.sections || {};
    const translatedSections = project?.translatedSections || {};

    const generatedSections = useMemo(
        () => (orderedSections || []).filter(key => sections[key]),
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

    const reportSectionsMap = useMemo(() => {
        return staticReportSections
    }, []);

    const handleExportReportDOCX = async (sectionsToInclude: SectionName[]) => {
        if (!project || generatedSections.length === 0) return;

        const translatedTitles = Object.keys(reportSectionsMap).reduce((acc, key) => {
            acc[key as SectionName] = t(reportSectionsMap[key as SectionName]?.title || key);
            return acc;
        }, {} as { [key in SectionName]?: string });

        await exportReportDocx(project, translatedTitles, sectionsToInclude);
    };

    const getSectionTitle = useCallback((sectionKey: SectionName) => {
        return reportSectionsMap[sectionKey]?.title || sectionKey;
    }, [reportSectionsMap]);

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
