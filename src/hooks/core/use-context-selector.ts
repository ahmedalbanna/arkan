
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useGenerationUIStore } from '@/hooks/core/useGenerationUIStore';
import { useBuilderStore } from '@/hooks/core/useBuilderStore';
import { useSections } from '@/hooks/data/use-sections';
import { useMemo } from 'react';

export function useContextSelector(itemKey: string) {
    const { t } = useLocalization();
    const { project } = useBuilderStore();
    const { data: allSections } = useSections();
    const { contextSelection, toggleContextSelection, initializeContext } = useGenerationUIStore();

    if (!contextSelection[itemKey]) {
        initializeContext(itemKey);
    }

    const currentSelection = contextSelection[itemKey] || { sections: {}, diagrams: {}, externalContext: [] };
    
    const reportSections = useMemo(() => {
        if (!allSections || !project?.sections) return [];
        // Filter sections to show only those that have been generated and are not the current section
        return allSections.filter(s =>
            s.type === 'report' &&
            s.id !== itemKey &&
            Object.keys(project.sections).includes(s.id)
        );
    }, [allSections, project?.sections, itemKey]);

    return {
        t,
        reportSections,
        toggleContextSelection,
        currentSelection,
        sections: project?.sections || {},
        externalContext: project?.externalContext || [],
    };
}
