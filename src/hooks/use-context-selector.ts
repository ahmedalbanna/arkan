
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useGenerationUIStore, useBuilderStore, useAgents } from '@/hooks'; // Changed
import { useMemo } from 'react';
import { SectionName, DiagramType } from '@/ai/schemas';
import type { AgentPrompt } from '@/lib/models/agent';
import { Agent, AgentCategory } from '@/lib/models/agent';
import { useSections } from './use-sections';

export const useContextSelector = (itemKey: string) => {
    const { t } = useLocalization();
    const { project } = useBuilderStore();
    const { contextSelection, toggleContextSelection: toggleStoreContext } = useGenerationUIStore();
    const { data: sectionConfigs } = useSections();
    
    // --- Start of Fix ---
    // All hooks are now called unconditionally at the top.
    const proposal = project?.proposal;
    const projectPlan = project?.projectPlan;
    const sections = project?.sections || {};
    const diagrams = project?.diagrams || {};
    const externalContext = project?.externalContext || [];
    
    const agent = useMemo(() => sectionConfigs?.find(s => s.id === itemKey), [sectionConfigs, itemKey]);
    const reportSections = useMemo(() => sectionConfigs?.filter(s => s.type === 'report') || [], [sectionConfigs]);
    const diagramSections = useMemo(() => sectionConfigs?.filter(s => s.type === 'diagram') || [], [sectionConfigs]);

    // This logic now runs after all hooks have been called.
    if (!sectionConfigs || !agent) {
        return {
            t,
            proposal: null,
            projectPlan: null,
            reportSections: [],
            diagramSections: [],
            currentSelection: { proposal: false, projectPlan: false, sections: {}, diagrams: {}, externalContext: [] },
            toggleContextSelection: () => {},
            selectedSections: [],
            selectedDiagrams: [],
            selectedExternalContext: [],
            hasContext: false,
            sections: {},
            diagrams: {},
            externalContext: [],
        };
    }
    // --- End of Fix ---

    const currentSelection = contextSelection[itemKey] || {
        proposal: false,
        projectPlan: false,
        sections: {},
        diagrams: {},
        externalContext: []
    };

    const toggleContextSelection = (
        key: string,
        type: 'proposal' | 'projectPlan' | 'sections' | 'diagrams' | 'externalContext',
        subKey: string | number | null,
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

    const hasContext = !!currentSelection.proposal || !!currentSelection.projectPlan || selectedSections.length > 0 || selectedDiagrams.length > 0 || selectedExternalContext.length > 0;

    return {
        t,
        proposal,
        projectPlan,
        reportSections, // Now this contains ALL possible report sections
        diagramSections, // Now this contains ALL possible diagram sections
        currentSelection,
        toggleContextSelection,
        selectedSections,
        selectedDiagrams,
        selectedExternalContext,
        hasContext,
        sections, // The content of generated sections
        diagrams, // The content of generated diagrams
        externalContext,
    };
};
