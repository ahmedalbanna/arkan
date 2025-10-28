
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useGenerationUIStore, useBuilderStore, useAgents, useSections } from '@/hooks';
import { useMemo } from 'react';
import { SectionName } from '@/ai/schemas';

export const useContextSelector = (itemKey: string) => {
    const { t } = useLocalization();
    const { project } = useBuilderStore();
    const { contextSelection, toggleContextSelection: toggleStoreContext } = useGenerationUIStore();
    const { data: sectionConfigs } = useSections();
    
    const sections = project?.sections || {};
    const externalContext = project?.externalContext || [];
    
    const reportSections = useMemo(() => sectionConfigs?.filter(s => s.type === 'report') || [], [sectionConfigs]);
    
    const currentSelection = contextSelection[itemKey] || {
        sections: {},
        diagrams: {},
        externalContext: []
    };

    const toggleContextSelection = (
        key: string,
        type: 'sections' | 'externalContext',
        subKey: string | number,
        checked: boolean
    ) => {
        toggleStoreContext(key, type, subKey, checked);
    };

    const selectedSections = Object.entries(currentSelection.sections || {})
        .filter(([, isSelected]) => isSelected)
        .map(([key]) => ({ key: key as SectionName, content: sections[key as SectionName] || '' }));


    const selectedExternalContext = (currentSelection.externalContext || [])
        .map((isSelected, index) => isSelected ? { ...externalContext[index], index } : null)
        .filter((item): item is { fileName: string; content: string; type: "context" | "example" | "question" | "textbook" | "guidelines"; index: number; } => item !== null);

    const hasContext = selectedSections.length > 0 || selectedExternalContext.length > 0;

    return {
        t,
        reportSections,
        toggleContextSelection,
        currentSelection,
        selectedSections,
        selectedExternalContext,
        hasContext,
        sections,
        externalContext,
    };
};
