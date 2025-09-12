'use client';

import { useMemo } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { useReportStore } from '@/hooks'; // contextSelection and toggleContextSelection are still here
import { type SectionName, type DiagramType, DiagramTypeSchema } from '@/ai/schemas';

const emptySelection = { sections: {}, diagrams: {}, externalContext: [], proposal: false, projectPlan: false };

export const useContextSelector = (itemKey: string) => {
    const { t } = useLocalization();
    const { project } = useBuilderStore(); // Get the project instance
    const { toggleContextSelection, contextSelection } = useReportStore(); // UI state from report store

    // Access data directly from the project instance
    const proposal = project?.proposal;
    const projectPlan = project?.projectPlan;
    const sections = project?.sections || {};
    const diagrams = project?.diagrams || {};
    const externalContext = project?.externalContext || [];

    const orderedSections = useMemo(() => Object.keys(sections).sort() as SectionName[], [sections]);
    const orderedDiagrams = DiagramTypeSchema.options;

    const currentSelection = contextSelection[itemKey] || emptySelection;

    const generatedSections = useMemo(() => orderedSections.filter(key => sections[key]), [orderedSections, sections]);
    const generatedDiagrams = useMemo(() => orderedDiagrams.filter(key => diagrams[key]), [orderedDiagrams, diagrams]);

    const selectedSections = useMemo(() => Object.keys(currentSelection.sections)
        .filter(key => currentSelection.sections[key] && sections[key as SectionName])
        .map(key => ({ key: key as SectionName, content: sections[key as SectionName]! })), [currentSelection.sections, sections]);

    const selectedDiagrams = useMemo(() => Object.keys(currentSelection.diagrams)
        .filter(key => currentSelection.diagrams[key] && diagrams[key as DiagramType])
        .map(key => ({ key: key as DiagramType, content: diagrams[key as DiagramType]!.plantUmlCode })), [currentSelection.diagrams, diagrams]);

    const selectedExternalContext = useMemo(() => (externalContext || [])
        .map((item, index) => ({ ...item, index }))
        .filter(item => currentSelection.externalContext[item.index]), [externalContext, currentSelection.externalContext]);

    const hasContext = useMemo(() =>
        (currentSelection.proposal && !!proposal) ||
        (currentSelection.projectPlan && !!projectPlan) ||
        selectedSections.length > 0 ||
        selectedDiagrams.length > 0 ||
        selectedExternalContext.length > 0,
        [currentSelection, proposal, projectPlan, selectedSections, selectedDiagrams, selectedExternalContext]
    );

    return {
        t,
        proposal,
        projectPlan,
        toggleContextSelection,
        sections,
        diagrams,
        currentSelection,
        generatedSections,
        generatedDiagrams,
        externalContext,
        selectedSections,
        selectedDiagrams,
        selectedExternalContext,
        hasContext,
    };
};