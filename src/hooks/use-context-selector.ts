
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useGenerationUIStore, useBuilderStore, useAgents, useSections } from '@/hooks';
import { useMemo } from 'react';
import { DiagramType, SectionName } from '@/ai/schemas';

export const useContextSelector = (itemKey: string) => {
    const { t } = useLocalization();
    const { project } = useBuilderStore();
    const { contextSelection, toggleContextSelection: toggleStoreContext } = useGenerationUIStore();
    const { data: sectionConfigs } = useSections();
    
    const sections = project?.sections || {};
    const diagrams = project?.diagrams || {};
    const externalContext = project?.externalContext || [];
    
    const reportSections = useMemo(() => sectionConfigs?.filter(s => s.type === 'report') || [], [sectionConfigs]);
    const diagramSections = useMemo(() => sectionConfigs?.filter(s => s.type === 'diagram') || [], [sectionConfigs]);

    const currentSelection = contextSelection[itemKey] || {
        sections: {},
        diagrams: {},
        externalContext: []
    };

    const toggleContextSelection = (
        key: string,
        type: 'sections' | 'diagrams' | 'externalContext',
        subKey: string | number,
        checked: boolean
    ) => {
        toggleStoreContext(key, type, subKey, checked);
    };

    const selectedSections = Object.entries(currentSelection.sections || {})
        .filter(([, isSelected]) => isSelected)
        .map(([key]) => ({ key: key as SectionName, content: sections[key as SectionName] || '' }));

    const selectedDiagrams = Object.entries(currentSelection.diagrams || {})
        .filter(([, isSelected]) => isSelected)
        .map(([key]) => ({ key: key as DiagramType, content: diagrams[key as DiagramType]?.plantUmlCode || '' }));

    const selectedExternalContext = (currentSelection.externalContext || [])
        .map((isSelected, index) => isSelected ? { ...externalContext[index], index } : null)
        .filter((item): item is { fileName: string; content: string; type: "context" | "example" | "question" | "textbook" | "guidelines"; index: number; } => item !== null);

    const hasContext = selectedSections.length > 0 || selectedDiagrams.length > 0 || selectedExternalContext.length > 0;

    return {
        t,
        reportSections,
        diagramSections,
        currentSelection,
        toggleContextSelection,
        selectedSections,
        selectedDiagrams,
        selectedExternalContext,
        hasContext,
        sections,
        diagrams,
        externalContext,
    };
};
