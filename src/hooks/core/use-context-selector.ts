
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useGenerationUIStore } from '@/hooks/core/useGenerationUIStore';
import { useBuilderStore } from '@/hooks/core/useBuilderStore';
import { useMemo } from 'react';

export function useContextSelector(itemKey: string) {
    const { t } = useLocalization();
    const { project } = useBuilderStore();
    const { contextSelection, toggleContextSelection, initializeContext } = useGenerationUIStore();

    if (!contextSelection[itemKey]) {
        initializeContext(itemKey);
    }

    const currentSelection = contextSelection[itemKey] || { sections: {}, diagrams: {}, externalContext: [] };

    const reportSections = useMemo(() => {
        if (!project?.sections) return [];

        // Get all section keys from the current project's sections
        return Object.keys(project.sections)
            .filter(sectionId => sectionId !== itemKey) // Exclude the current section from its own context
            .map(sectionId => ({
                id: sectionId,
                // Use the title stored in the project, or fallback to a formatted ID
                title: project.sections?.[sectionId]?.title || sectionId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            }));

    }, [project?.sections, itemKey]);

    return {
        t,
        reportSections,
        toggleContextSelection,
        currentSelection,
        sections: project?.sections || {},
        externalContext: project?.externalContext || [],
    };
}
