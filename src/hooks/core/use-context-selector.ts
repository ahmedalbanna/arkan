
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks/core/useBuilderStore';
import { useGenerationUIStore } from '@/hooks/core/useGenerationUIStore';
import { useEffect, useMemo } from 'react';

export function useContextSelector(itemKey: string) {
    const { t } = useLocalization();
    const { project } = useBuilderStore();
    const { contextSelection, toggleContextSelection, initializeContext } = useGenerationUIStore();

    // The state initialization now happens inside a useEffect hook
    // to prevent updating state during the render cycle.
    useEffect(() => {
        if (!contextSelection[itemKey]) {
            initializeContext(itemKey);
        }
    }, [itemKey, contextSelection, initializeContext]);


    const currentSelection = contextSelection[itemKey] || { sections: {}, diagrams: {}, externalContext: [] };

    const reportSections = useMemo(() => {
        if (!project?.sections) return [];
        // The sections are now directly on the project object as an array of Section instances.
        return project.sections
            .filter(section => section.id !== itemKey) // Exclude the current section from its own context
            .map(section => ({
                id: section.id,
                title: section.title,
            }));
    }, [project?.sections, itemKey]);

    const sectionsContent = useMemo(() => {
        if (!project?.sections) return {};
        return project.sections.reduce((acc, section) => {
            acc[section.id] = section.content || '';
            return acc;
        }, {} as Record<string, string>);
    }, [project?.sections]);


    return {
        t,
        reportSections,
        toggleContextSelection,
        currentSelection,
        sections: sectionsContent,
        externalContext: project?.externalContext || [],
    };
}
